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
const privateKey = '6812633245de403410cdaa7b5324853d9a9e99cc496715a06a528dd64f68ce31';

// initalize tron network
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);



const purchase = async (id, body) => {
    const user = await User.findById(id);

    // func to get user balance
    async function triggerSmartContract(address) {
        const trc20ContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";//usdt contract address

        try {
            let contract = await tronWeb.contract().at(trc20ContractAddress);
            //Use call to execute a pure or view smart contract method.
            // These methods do not modify the blockchain, do not cost anything to execute and are also not broadcasted to the network.
            let result = await contract.balanceOf(address).call();
            return tronWeb.fromSun(parseInt(result.toString()));
        } catch (error) {
            return error
        }
    }

    const balData = await triggerSmartContract(user.blockchainAddress);
    const balance = Number(balData);


    if (user.packages.includes(body.package + ' ' + 'Larva') === false) {
        if (body.price <= balance) {
            const deduct = await sendToWallet(user.privateKey, tronWeb.toSun(body.price));
            if (!deduct) {
                return {
                    success: false,
                    message: 'An error has occurred. Please try again later.',
                }
            } else {
                user.wallet -= body.price;

                let package = {
                    name: body.package + ' ' + 'Larva',
                    createdAt: currentDate,
                    amountEarned: 0
                }

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