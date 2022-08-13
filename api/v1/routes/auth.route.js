const router = require('express').Router();

// middlewares
const verify_token = require('../middlewares/authorizeToken.js');

// controllers
const { CreateUser, getUser, LoginUser, verifyUser, updateUserFields, changeUserPassword } = require('../controllers/auth.controller')


router.get('/user', verify_token, getUser)

router.post('/register', CreateUser)
router.post('/login', LoginUser)
router.post('/verifyUser', verifyUser)

router.put('/user/update', verify_token, updateUserFields)
router.patch('/user/update/password', verify_token, changeUserPassword)


module.exports = router