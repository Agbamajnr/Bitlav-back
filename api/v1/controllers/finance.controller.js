const User = require('../models/user.model');
const Withdraw = require('../models/withdraw.model');
const Transaction = require('../models/transaction.model');

const moment = require('moment');
let currentDate = moment().format()

const withdraw = require('../services/Finance/withdraw.service');

const withdrawFunds = async(req, res) => {
    const user = await User.findById(req.user._id);
    const info = await withdraw(req.body, currentDate, req.user._id)
    res.send(info);
}

const getTransaction = async (req, res) => {
    // const user = await User.findById(req.user._id);
    const transaction = await Transaction.findById(req.body.id);
    res.send(transaction)
}

module.exports = {
    withdrawFunds,
    getTransaction
}