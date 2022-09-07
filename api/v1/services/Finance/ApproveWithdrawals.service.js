const User = require('../../models/user.model');
const Withdraw = require('../../models/withdraw.model');
const Transaction = require('../../models/transaction.model');

const moment = require('moment');
let time = moment().format('LTS')
let date = moment().format('L')
let currentDate = moment().format('LLL')

function calcPercentage(num, perc) {
    const value = num * (perc / 100);
    return value;
}

const sendToUser = require('../../helpers/sendToUser')

const approve = async (body, id) => {
    const user = await User.findById(id);

    const withdrawalRxp = await Withdraw.findById(body.id)
    const txn = await Transaction.findById(withdrawalRxp.txId)

    if(!txn) {
        return {
            success: false,
            message: 'Transaction not found'
        }
    }

    let processedAmount = withdrawalRxp.amount - calcPercentage(withdrawalRxp.amount, 5)
    console.log(processedAmount)

    // deduct money from 
    if (body.response === 'APPROVED') {

        const send = await sendToUser(withdrawalRxp.address, withdrawalRxp.amount / 0.000001);

        try {
            if (!send.message) {
                user.escrow -= processedAmount;
                user.wallet += processedAmount;
                withdrawalRxp.status = 'FAILED';
                txn.status = 'CANCELED'

                await user.save()
                await withdrawalRxp.save();
                await txn.save();

                return {
                    success: false,
                    message: 'Failed to withdraw money. Please try again later.',
                    error: send.error.message
                }
            } else {
                user.escrow -= processedAmount;
                withdrawalRxp.status = 'SUCCESS';
                txn.status = 'COMPLETED'
                txn.fee = calcPercentage(withdrawalRxp.amount, 5);
                txn.mountId = send.response.txId;

                await user.save()
                await withdrawalRxp.save();
                await txn.save();

                return {
                    success: true,
                    message: 'Withdrawal Successful',
                    error: null,
                }
            }
        } catch (error) {
            user.escrow -= processedAmount;
            user.wallet += processedAmount;
            withdrawalRxp.status = 'FAILED';
            txn.status = 'CANCELED'

            await user.save()
            await withdrawalRxp.save();
            await txn.save();

            console.log(send)

            return {
                success: false,
                message: send.error.message,
                error: null
            }
        }



    } else {
        user.escrow -= processedAmount;
        user.wallet += processedAmount;
        withdrawalRxp.status = 'FAILED';
        txn.status = 'CANCELED'

        await user.save()
        await withdrawalRxp.save();
        await txn.save();

        return {
            success: false,
            message: 'Your withdrawal request was nulled because of some illegal activities detected in your account',
            error: null
        }
    }



}

module.exports = approve;