const dotenv = require("dotenv");
dotenv.config();

const Retros = require('./database/models/Retrospectives')
const Users = require('./database/models/Users')
const Inputs = require('./database/models/Inputs')
const Teams = require('./database/models/Teams')


var createError = require('http-errors');
var express = require('express');
var expressSession = require('express-session')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var connectMongo = require('connect-mongo')
var connectFlash = require('connect-flash')


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

const PORT = process.env.PORT || 3050;
server.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});

var timers = []

io.on('connection', socket => {
  socket.removeAllListeners()
  console.log('Socket conectado: ' + socket.id)
  socket.on('newUser', (retroid, userid) => {

    socket.join(retroid)

    Retros.findById(retroid, (err, retro) => {

      if (!retro.attendees.includes(userid)) {
        retro.updateOne({ $push: { attendees: userid } }, (err, result) => {
        })
      }

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

  socket.on('nextStep', (data) => {
    console.log('Next Step :' + data)
    socket.to(data).emit('goToNext', { retroid: data })
  })

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
    Retros.findByIdAndUpdate(input.retroid, { $pull: { inputs: input.inputid } }, (err, result) => {
      if (err) {
        console.log(err)
      } else {

        Inputs.findByIdAndDelete(input.inputid, (err, resultInput) => {
          if (err) {
            console.log(err)
          }
          else {
          }
          io.to(input.retroid.toString()).emit('removeInput', resultInput)
        })
      }
    })
  })

  socket.on('createAction', (action) => {
    console.log('Creating Action Item:')
    console.log(action.retroid)
    console.log(action.owner)

    Teams.findOneAndUpdate({ retrospectives: action.retroid }, { $push: { actionitems: { text: action.text, owner: action.owner, retrospective: action.retroid } } }, { new: true }, (err, team) => {
      console.log(team)
      Users.findById(action.owner, (err, user) => {
        if (err) {
          console.log(err)
        } else {
          io.to(action.retroid).emit('createActionItem', { actionitem: team.actionitems.pop(), owner: user })
        }
      })
    }).populate('actionitems.retrospective')
  })

  socket.on('completeActionItem', (action) => {
    console.log('Complete action item')
    socket.to(action.retroid).emit('completedActionItem', action.actionid)
  })

  socket.on('changeFacilitator', retroid => {
    socket.to(retroid).emit('facilitatorChanged', retroid)
  })

  socket.on('StopCountDown', (data) => {
    var timer = timers.find(t => t.retroid == data)
    if (timer) {
      clearInterval(timer.interval)
      timers.splice(timers.indexOf(timers.find(t => t.retroid == data.retroid)))
    }
  })

  socket.on('StartCountDown', (data) => {
    console.log('The timer has been set')
    console.log(data.sec)
    console.log(data.retroid)

    var timer = timers.find(t => t.retroid == data.retroid)

    if (timer) {
      clearInterval(timer.interval)
      timers.splice(timers.indexOf(timers.find(t => t.retroid == data.retroid)))
    }

    Retros.findByIdAndUpdate(data.retroid, { seconds: data.sec, count: 0 }, { new: true }, (err, retro) => {
      io.to(retro._id).emit('UpdateTimer', convertSeconds(retro.seconds - retro.count)) //SEND TO ALL SOCKETS

    })

    var interval = setInterval(timeIt, 1000)

    timer = { interval: interval, retroid: data.retroid }

    timers.push(timer)

    console.log(timers)

    function timeIt() {

      Retros.findById(data.retroid, (err, retro) => {
        counter = retro.count + 1
        Retros.findByIdAndUpdate(retro._id, { count: counter }, { new: true }, (err, result) => {
          io.to(retro._id).emit('UpdateTimer', convertSeconds(result.seconds - result.count))           //SEND TO ALL SOCKETS
          if (result.count == result.seconds) {
            result.updateOne({ count: 0 }, (err, result) => { })
            clearInterval(interval)
            io.to(retro._id).emit('TimeisUp')
          }
        })
      })
    }

    function convertSeconds(s) {
      var min = Math.floor(s / 60)
      var sec = Math.floor(s % 60)

      return {
        min: min.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }),
        sec: sec.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
      }
    }
  })

})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(connectFlash())
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
