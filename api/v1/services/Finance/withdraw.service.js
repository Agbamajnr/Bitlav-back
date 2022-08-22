const User = require('../../models/user.model');
const Withdraw = require('../../models/withdraw.model');
const Transaction = require('../../models/transaction.model');


const withdraw = async (body, currentDate, id) => {
    const user = await User.findById(id);
    if(user.wallet < body.amount) {
        return {
            success: false,
            message: 'Balance too low',
        }
    } else {
        const txn = new Transaction({
            userId: id,
            amount: body.amount,
            status: 'PENDING',
            txnType: 'WITHDRAW',
            mountId: null,
            fee: 0,
            createdAt: currentDate
        })  
        const txnRES = await txn.save();
        const withdraw = new Withdraw({
            userId: id,
            amount: body.amount,
            address: body.address,
            createdAt: currentDate,
            status: 'PENDING',
            txId: txnRES._id
        })
        const withdrawRES = await withdraw.save();
        const mainTxn = await Transaction.findById(txnRES._id);
        mainTxn.mountId = withdrawRES._id;
        await mainTxn.save();

        user.wallet = user.wallet - body.amount;
        user.escrow = body.amount;
        user.transactions.push(mainTxn._id);
        const result  = await user.save();
        return {
            success: true,
            message: 'Withdrawal request sent'
        }
        
    }
}

module.exports = withdraw;