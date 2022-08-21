const User = require('../models/user.model');
const Withdraw = require('../models/withdraw.model');

const moment = require('moment');
let currentDate = moment().format()

const withdraw = require('../services/Finance/withdraw.service');

const withdrawFunds = async(req, res) => {
    const user = await User.findById(req.user._id);
    const info = await withdraw(req.body, currentDate, req.user._id)
    res.send(info);
}

module.exports = {
    withdrawFunds
}