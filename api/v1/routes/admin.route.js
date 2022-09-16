const router = require('express').Router();

// controllers
const { approveWithdrawals, infos, getWithdrawals, getWithdrawal, getTickets, deleteTicket } = require('../controllers/admin.controller')


router.post('/approve/withdrawal', approveWithdrawals)
router.get('/info', infos)
router.get('/withdrawals/fetch', getWithdrawals)
router.post('/withdrawal/fetch', getWithdrawal)

router.get('/tickets', getTickets)
router.post('/ticket', deleteTicket)



module.exports = router