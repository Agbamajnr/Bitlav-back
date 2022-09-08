const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const Withdraw = require('../models/withdraw.model');


const approve = require('../services/Finance/ApproveWithdrawals.service');

const approveWithdrawals = async (req, res) => {
    if (req.body.fingerprint !== 'BITLAV2023ADMINONPOMO0x50432135') {
        res.status(401).send({
            message: 'Invalid Admin signature'
        })
    } else {
        const info = await approve(req.body, req.body.userId);
        res.send(info);
    }
}

const infos = async (req, res) => {

    const userCount = await User.countDocuments({ verified: true });
    const withdrawalsCount = await Withdraw.countDocuments({ status: 'SUCCESS' });
    const depositCount = await Transaction.find()

    let addedDepo = 0;

    depositCount.forEach(deposit => {
        if (deposit.txnType == 'WALLET DEPOSIT') {
            console.log(deposit.amount)
            addedDepo = deposit.amount + addedDepo;
        }
    })

    console.log(withdrawalsCount, userCount, addedDepo)

    res.send({
        users: userCount,
        withdrawals: withdrawalsCount,
        deposits: addedDepo,
    })
}

const getWithdrawals = async (req, res) => {

    const Doc = await Withdraw.find();

    let list = Doc.filter(doc => {
        return doc.status === 'PENDING'
    })


    res.send({
        list
    })
}

const getWithdrawal = async (req, res) => {
    if (req.body.fingerprint !== 'BITLAV2023ADMINONPOMO0x50432135') {
        res.status(401).send({
            message: 'Invalid Admin signature'
        })
    } else {
        const Doc = await Withdraw.findById(req.body.id);
        const user = await User.findById(Doc.userId);
        const txn = await Transaction.findById(Doc.txId)

        res.send({
            name: user.fname + ' ' + user.lname,
            date: txn.date,
            amount: Doc.amount,
            address: Doc.address,
            others: Doc
        })
    }
}




module.exports = {
    approveWithdrawals,
    getWithdrawals,
    getWithdrawal,
    infos
}