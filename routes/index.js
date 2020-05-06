require('dotenv').config
//imports
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const multer = require('multer')

// controllers
const teamController = require('../controllers/teamController')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const retroController = require('../controllers/retroController')
const actionController = require('../controllers/actionController')

const app = express()

app.use(bodyParser.json())

app.use(fileUpload())
var publicDir = require('path').join(__dirname, '/public');
app.use(express.static(publicDir));

var node_modules = require('path').join(__dirname, '/node_modules');
app.use(express.static(node_modules));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    console.log(file)
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
})

var upload = multer({ storage: storage })



//Routers

//HOME
router.get('/', userController.index)

//LOAD LOGIN PAGE
router.get('/login', authController.redirectIfAuth, userController.login)

//SUBMIT LOGIN
router.post('/login', authController.redirectIfAuth, userController.loginUser)

//LOAD REGISTER PAGE
router.get('/register', authController.redirectIfAuth, userController.register)

//SUBMIT REGISTRATION
router.post('/register', authController.redirectIfAuth, userController.registerUser);

//LOAD USER DETAIS PAGE
router.get('/user/details/:id', authController.auth, userController.details)

//SUBMIT USER UPDATE
router.post('/user/edit/:id', upload.single('image'), authController.auth, userController.update)

//UPDATE USER PASSWORD
router.post('/user/password/:id',  authController.auth, userController.updatePassword)


//LOGOUT
router.get('/logout', authController.redirectIfAuth, authController.logout);

//GET TEAMS
router.get('/teams', authController.auth, teamController.list)

//GET TEAM
router.get('/teams/details/:id', authController.auth, teamController.details)

//CREATE TEAM GET
router.get('/teams/create', authController.auth, teamController.create)

//CREATE TEAM POST
router.post('/teams/create', upload.single('image'), authController.auth, teamController.save)

//UPDATE TEAM
router.post('/teams/edit/:id', upload.single('image'), authController.auth, teamController.update)

//ADD TEAM MEMBER
router.post('/teams/add/member/:id', authController.auth, teamController.addMember)

//REMOVE TEAM MEMBER
router.post('/teams/remove/member/:id', authController.auth, teamController.removeMember)

//DELETE TEAM
router.delete('/teams/delete/:id/', authController.auth, teamController.delete)

//CREATE ACTION ITEM
// router.post('/action/create', authController.auth, actionController.save)

//COMPLETE ACTION ITEM
router.get('/action/complete/:id/', authController.auth, actionController.complete)

//CANCEL ACTION ITEM
router.get('/action/cancel/:id/', authController.auth, actionController.cancel)

//REOPEN ACTION ITEM
router.get('/action/open/:id/', authController.auth, actionController.open)

//CREATE TEAM RETROSPECTIVE
router.post('/retro/create', authController.auth, retroController.save)

//LIVE RETRO
router.get('/retro/live/:id', authController.auth, retroController.live)

//LIVE RETRO NEXT STEP
router.get('/retro/live/next/:id', authController.auth, retroController.nextStep)

//LIVE RETRO PREVIOUS STEP
router.get('/retro/live/previous/:id', authController.auth, retroController.previousStep)

//LIVE RETRO COMPLETE MEETING
router.post('/retro/live/complete/:id', authController.auth, retroController.completeRetrospective)

//RETRO COMPLETED MEETING
router.get('/retro/complete/:id', authController.auth, retroController.completedRetro)



module.exports = router;