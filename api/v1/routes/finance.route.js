const router = require('express').Router();

// middlewares
const verify_token = require('../middlewares/authorizeToken.js');

// controllers
const { withdrawFunds } = require('../controllers/finance.controller')


router.post('/withdraw', verify_token, withdrawFunds);



module.exports = router