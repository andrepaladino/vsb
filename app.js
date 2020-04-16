const dotenv = require("dotenv");
dotenv.config();

const Retros = require('./database/models/Retrospectives')
const Users = require('./database/models/Users')
const Inputs = require('./database/models/Inputs')


var createError = require('http-errors');
var express = require('express');
var expressSession = require('express-session')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var connectMongo = require('connect-mongo')

const PORT = process.env.PORT || 3050;


var app = express()



const server = require('http').createServer(app)
const io = require('socket.io')(server)

const mongoStore = connectMongo(expressSession)
mongoose.connect(process.env.MONGODB_URI, { //ADD TO ENV
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})

app.use(expressSession({
  secret: process.env.EXPRESS_SECRET, //ADD TO ENV
  resave: true,
  saveUninitialized: true,
  store: new mongoStore({
    mongooseConnection: mongoose.connection
  })
}))

app.use(function (req, res, next) {
  if (req.session.user) {
    res.locals.user = req.session.user
  }
  next()
})

var indexRouter = require('./routes/index');

// const PORT = process.env.PORT || 3050;
// app.listen(PORT, () => {
//     console.log(`Our app is running on port ${ PORT }`);
// });


io.on('connection', socket => {
  console.log('Socket conectado: ' + socket.id)

  socket.on('newUser', (retroid, userid) => {

    socket.join(retroid)

    Retros.findById(retroid, (err, retro) => {
      if (!retro.participants.includes(userid)) {
        retro.updateOne({ $push: { participants: userid } }, (err, result) => {
        })
      }
      retro.participants.forEach(e => {
        console.log('Already Online: ' + e)
        socket.emit('onlineUser', e)
      })

    }).populate('inputs').exec(function (err, retros) {
      Inputs.populate(retros.inputs, { path: 'user' }, (err, result) => {
        socket.emit('previousMessages', result)
      })
    })

    io.to(retroid).emit('onlineUser', userid)

  })

  socket.on('leavePage', function (disconect) {
    console.log('Got disconnect!')
    console.log('userid: ' + disconect.userid)
    console.log('retroid: ' + disconect.retroid)
    socket.leaveAll()

    Retros.findById(disconect.retroid, (err, retro) => {
      if (retro.participants.includes(disconect.userid)) {
        retro.updateOne({ $pull: { participants: disconect.userid } }, (err, result) => {
          if (err)
            console.log(err)
        })
      }
    })
    io.to(disconect.retroid).emit('offlineUser', disconect.userid)
  });

  socket.on('changePosition', (coord) => {
    Inputs.findByIdAndUpdate(coord.element, { category: coord.target, positionLeft: coord.left, positionTop: coord.top }, (err, result) => {
      if (err)
        console.log(err)
      socket.to(coord.retroid.toString()).emit('updatePosition', coord)
    })
  })

  socket.on('likeInput', (object) => {

    Users.findById(object.userid, (err, user) => {
      if (err) {
        console.log(err)
      } else {
        Inputs.findById(object.inputid, (err, input) => {
          //Remove like from input
          if (input.likes.includes(user._id)) {
            console.log('Remove Like')

            Inputs.findByIdAndUpdate(input._id, { $pull: { likes: user._id } }, { new: true }, (err, inputResult) => {
              if (err)
                console.log(err)
              console.log(inputResult.likes.length)
              io.to(object.retroid).emit('updateLikes', inputResult)
            })
          } else {
            //Add like to input
            console.log('Add Like')

            Inputs.findByIdAndUpdate(input._id, { $push: { likes: user._id } }, { new: true }, (err, inputResult) => {
              if (err)
                console.log(err)
              console.log(inputResult.likes.length)
              io.to(object.retroid).emit('updateLikes', inputResult)
            })
          }
        })
      }
    })
  })

  socket.on('sendMessage', (messageObject) => {
    console.log('Send Message: ')
    console.log(messageObject)

    // Refactor required to send this method to the controller
    Users.findById(messageObject.user, (err, user) => {
      if (err)
        console.log(err)

      Inputs.create({
        text: messageObject.text,
        user: user._id,
        category: messageObject.category
      }, (err, input) => {
        if (err)
          console.log(err)
        Retros.findById((messageObject.retroid), (err, retrospective) => {
          retrospective.updateOne({
            $push: {
              inputs: [input._id]
            }
          }, (err, result) => {
            if (err) {
              console.log(err)
            }
            else {
              Inputs.findById(input._id, (err, createdInput) => {
                console.log('Created Input: ')
                console.log(createdInput)
                console.log('Saving Input in Database')
                console.log(result)
                socket.in(messageObject.retroid.toString()).emit('receivedMessage', createdInput)
                socket.emit('receivedMessage', createdInput)
              }).populate('user')
            }
          })
        })
      })
    })
  })

  socket.on('deleteInput', (input) => {
    Inputs.findByIdAndDelete(input.inputid, (err, result) => {
      io.to(input.retroid.toString()).emit('removeInput', result)
    })
  })


  socket.on('createAction', (action) => {
    console.log('Creating Action Item:')
    console.log(action.retroid)
    console.log(action.owner)

    Retros.findByIdAndUpdate(action.retroid, { $push: { actionitems: { text: action.text, owner: action.owner } } }, { new: true }, (err, result) => {
      console.log(result)
      Users.findById(action.owner, (err, user) => {
        if (err)
          console.log()
        console.log('AI Onwer: ' + user)
        io.to(action.retroid).emit('createActionItem', { actionitem: result.actionitems.pop(), owner: user })
      })
    })
  })

  socket.on('cancelActionItem', (actionid) => {
    Retros.findOneAndUpdate({ actionitems: { $elemMatch: { _id: actionid } } }, { $set: { 'actionitems.$.status': 'CANCELLED' } }, { new: true }, (err, result) => {
      if (err) {
        console.log(err)
      } else {
        console.log(result)
      }
      io.to(result._id).emit('cancelledActionItem', actionid)
    })
  })

  socket.on('completeActionItem', (actionid) => {
    Retros.findOneAndUpdate({ actionitems: { $elemMatch: { _id: actionid } } }, { $set: { 'actionitems.$.status': 'COMPLETED' } }, { new: true }, (err, result) => {
      if (err) {
        console.log(err)
      } else {
        console.log(result)
      }
      io.to(result._id).emit('completedActionItem', actionid)
    })
  })

  socket.on('refreshPage', (retroid) => {
    io.to(retroid).emit('refreshRetroPage')
  })

})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'))
app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/socket.io.js'))
app.use('/jquery', express.static(__dirname + 'node_modules/socket.io-client/dist/socket.io.js'))

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
