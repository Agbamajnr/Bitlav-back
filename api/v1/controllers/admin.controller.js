const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const Withdraw = require('../models/withdraw.model');
const Ticket = require('../models/ticket.model');


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
            addedDepo = deposit.amount + addedDepo;
        }
    })


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

        res.send({
            name: user.fname + ' ' + user.lname,
            date: Doc.createdAt,
            amount: Doc.amount,
            address: Doc.address,
            others: Doc
        })
    }
}


const getTickets = async (req, res) => {
    if (req.body.fingerprint !== 'BITLAV2023ADMINONPOMO0x50432135') {
        res.status(401).send({
            message: 'Invalid Admin signature'
        })
    } else {
        const issues = []
        try {
            const list = await Ticket.find();
            list.forEach(async (ticket) => {
                const user = await User.findById(ticket.userId);
                let data = {
                    name: user.fname + ' ' + user.lname,
                    date: ticket.dateCreated,
                    time: ticket.timeCreated,
                    email: user.email,
                    subject: ticket.subject,
                    description: ticket.desc,
                    ticketId: ticket.publicId,
                    id: ticket._id
                }

                issues.push(data)
            })
        } catch (error) {
            console.log(error.name)
        }

        res.send(issues)
    }
}

const deleteTicket = async (req, res) => {
    if (req.body.fingerprint !== 'BITLAV2023ADMINONPOMO0x50432135') {
        res.status(401).send({
            message: 'Invalid Admin signature'
        })
    } else {
        try {
            const ticket = await Ticket.findByIdAndDelete(req.body.id)

            res.send({
                message: 'Ticket deleted'
            })
        } catch (error) {
            console.log(error.name)
        }
    }
}








module.exports = {
    approveWithdrawals,
    getWithdrawals,
    getWithdrawal,
    infos,
    getTickets,
    deleteTicket
}