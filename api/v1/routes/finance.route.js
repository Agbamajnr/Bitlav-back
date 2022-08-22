const router = require('express').Router();

// middlewares
const verify_token = require('../middlewares/authorizeToken.js');

// controllers
const { withdrawFunds, getTransaction } = require('../controllers/finance.controller')


router.post('/withdraw', verify_token, withdrawFunds);
router.post('/transaction', verify_token, getTransaction)



module.exports = router