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

//tronWeb
const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = '573C602BF65AD5FB1BBCD1FA8D9A6399C41B934C9AECF158300B0AC07F040894';
const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);

const ACCOUNT = "TApg7EBMwqBSdTSpMGx3MARad8UEkxK5ET";

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

    let processedAmount = withdrawalRxp.amount - calcPercentage(withdrawalRxp.amount, 3)
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

                try {
                    const tradeObj = await tronWeb.transactionBuilder.sendTrx(user.blockchainAddress, 1000000 * calcPercentage(withdrawalRxp.amount, 5), ACCOUNT);
                    const signedtxn = await tronWeb.trx.sign(tradeObj, '573C602BF65AD5FB1BBCD1FA8D9A6399C41B934C9AECF158300B0AC07F040894');
    
                    // Broadcast
                    const receipt = await tronWeb.trx.sendRawTransaction(
                        signedtxn
                    )
                } catch (error) {
                    console.log(error);
                }

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