const router = require('express').Router();

// middlewares
const verify_token = require('../middlewares/authorizeToken.js');

// controllers
const { CreateUser, getUser, LoginUser, verifyUser, updateUserFields, changeUserPassword, verifyOTPsent } = require('../controllers/auth.controller')


router.get('/user', verify_token, getUser)

router.post('/register', CreateUser)
router.post('/login', LoginUser)
router.post('/user/verify', verifyUser)
router.post('/user/verifyOTP', verifyOTPsent)

router.put('/user/update', verify_token, updateUserFields)
router.patch('/user/update/password', verify_token, changeUserPassword)


module.exports = router