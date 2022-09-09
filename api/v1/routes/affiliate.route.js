const router = require('express').Router();

// middlewares
const verify_token = require('../middlewares/authorizeToken.js');

// controllers
const { getReferral, globalRankings } = require('../controllers/affiliate.controller')


router.post('/referral/', verify_token, getReferral)
router.get('/rankings', globalRankings)



module.exports = router