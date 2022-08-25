const router = require('express').Router();

// middlewares
const verify_token = require('../middlewares/authorizeToken.js');

// controllers
const { withdrawFunds, getTransaction, purchasePackage } = require('../controllers/finance.controller')


router.post('/withdraw', verify_token, withdrawFunds);
router.post('/transaction', verify_token, getTransaction)
router.post('/purchase/package', verify_token, purchasePackage);



module.exports = router