const router = require('express').Router();

// middlewares
const verify_token = require('../middlewares/authorizeToken.js');

// controllers
const { getReferral } = require('../controllers/affiliate.controller')


router.get('/referral/', verify_token, getReferral)



module.exports = router