const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');


const withdraw = require('../services/Finance/withdraw.service');
const purchase = require('../services/Finance/purchasePackage.service');

const withdrawFunds = async(req, res) => {
    const user = await User.findById(req.user);
    if(!user) {
        res.status(404).send({
            message: 'User not found',
        })
    } else {
        const info = await withdraw(req.body, req.user)
        res.send(info);
    }
}

const getTransaction = async (req, res) => {
    const user = await User.findById(req.user);
    if(!user) {
        res.status(404).send({
            message: 'User not found',
        })
    } else {
        const transaction = await Transaction.findById(req.body.id);
        res.send(transaction)
    }  
}

const purchasePackage = async(req, res) => {
    const user = await User.findById(req.user);
    if(!user) {
        res.status(404).send({
            message: 'User not found',
        })
    } else {
        const purchs = await purchase(user._id, req.body)
        res.send(purchs)
    }
}

module.exports = {
    withdrawFunds,
    getTransaction,
    purchasePackage
}