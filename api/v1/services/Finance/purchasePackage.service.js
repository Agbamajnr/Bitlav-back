const User = require('../../models/user.model');
const Transaction = require('../../models/transaction.model');
const Referral = require('../../models/referral.model')

// manage time
const moment = require('moment');
let time = moment().format('LTS')
let date = moment().format('L')
let currentDate = moment().format('LLL')

// helpers
const sendToWallet = require('../../helpers/sendToWallet')

// functions
function calcPercentage(num, perc) {
    const value = num * (perc / 100);
    return value;
}

// tron network
const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = '573C602BF65AD5FB1BBCD1FA8D9A6399C41B934C9AECF158300B0AC07F040894';

// initalize tron network
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);



const purchase = async (id, body) => {
    const user = await User.findById(id);


    if (user.packages.includes(body.package + ' ' + 'Larva') === false) {
        if (body.price <= user.wallet) {

            user.wallet = user.wallet - body.price;

            let package = {
                name: body.package + ' ' + 'Larva',
                createdAt: currentDate,
                amountInvested: body.amount,
                amountEarned: 0
            }

            console.log('send to account')

            user.packages.push(package);
            user.currentPackage = body.package + ' ' + 'Larva'

            const txn = new Transaction({
                userId: user._id,
                amount: body.price,
                status: 'COMPLETED',
                txnType: 'PURCHASE PACKAGE',
                mountId: null,
                fee: 0,
                createdAt: currentDate,
                time: time,
                date: date,
            })
            const txnRES = await txn.save();
            // add to user transactions
            user.transactions.push(txnRES._id);
            const savedUser = await user.save();
            // share package interest to team;
            let parentReferral, grandParent, greatGrandParent;
            // link affiliate team
            if (user.userRefferedBy.length > 3) {
                parentReferral = await Referral.findOne({ userReffering: user.userRefferedBy });
                console.log(parentReferral)
                if (parentReferral !== null) {
                    const parent = await User.findOne({ userReffering: parentReferral.userReffered });
                    console.log(parent)
                    parent.wallet += calcPercentage(body.price, 0.2)
                    // save to referral model
                    parentReferral.referralEarnings += calcPercentage(body.price, 0.2)
                    await parentReferral.save()
                    await parent.save()

                    // share to grand parents
                    if (parent.userRefferedBy.length > 3) {
                        grandParent = await Referral.findOne({ userReffering: parent.userRefferedBy });
                        if (grandParent !== null) {
                            const grandRf = await User.findOne({ userReffering: grandParent.userReffered });
                            grandRf.wallet += calcPercentage(body.price, 0.130)

                            grandParent.referralEarnings += calcPercentage(body.price, 0.130)
                            await grandParent.save()
                            await grandRf.save()

                            // share to grand parents
                            if (grandRf.userRefferedBy.length > 3) {
                                greatGrandParent = await Referral.findOne({ userReffering: grandRf.userRefferedBy });
                                if (greatGrandParent !== null) {
                                    const greatGrandRf = await User.findOne({ userReffering: greatGrandParent.userReffered });
                                    greatGrandRf.wallet += calcPercentage(body.price, 0.07)

                                    greatGrandParent.referralEarnings += calcPercentage(body.price, 0.2)
                                    await greatGrandParent.save()
                                    await greatGrandRf.save()
                                }
                            }
                        }
                    }
                }
                return {
                    success: true,
                    error: null,
                    message: body.package + ' Larva' + ' was successfully purchased'
                }
            }

        } else {
            return {
                success: false,
                error: 'NA',
                message: body.package + ' Larva' + ' purchase failed because of insufficient balance'
            }
        }
    } else {
        return {
            success: false,
            error: 'AV',
            message: body.package + ' Larva' + ' has already been purchased'
        }
    }
}

module.exports = purchase;