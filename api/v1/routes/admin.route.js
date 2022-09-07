const router = require('express').Router();

// controllers
const { approveWithdrawals, infos, getWithdrawals } = require('../controllers/admin.controller')


router.post('/approve/withdrawal', approveWithdrawals)
router.get('/info', infos)
router.post('/withdrawals/fetch', getWithdrawals)



module.exports = router