//models
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const axios = require('axios');

const moment = require('moment');
let time = moment().format('LTS')
let date = moment().format('L')
let currentDate = moment().format('LLL')
const CryptoJS = require("crypto-js");



// services
const run_service = require('../services/Auth/createUser.service');
const login_service = require('../services/Auth/loginUser.service');
const updateUser = require('../services/Auth/updateUser.service');
const verifyUserWithOtp = require('../services/Auth/verifyUser.service');
const changePwd = require('../services/Auth/changePassword.service');
const resetPwd = require('../services/Auth/resetPassword.service');



// helpers
const sendToWallet = require('../helpers/sendToWallet')

// tron network
const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");
const privateKey = '573C602BF65AD5FB1BBCD1FA8D9A6399C41B934C9AECF158300B0AC07F040894';


const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);


const CreateUser = async (req, res) => {
    const data = await run_service(currentDate, req.body);
    if (data.success !== false) {
        const { password, ...info } = data;
        res.status(201).send(info);
    } else {
        res.status(201).send(data);
    }
}


const getUser = async (req, res) => {
    const user = await User.findById(req.user);

    if (user !== null) {


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



        // check for new deposits
        const getDeposits = await axios.get(`https://api.trongrid.io/v1/accounts/${tronWeb.address.toHex(user.blockchainAddress)}/transactions/trc20`)

        let allDeposits = getDeposits.data.data.filter(data => {
            return user.blockchainAddress === data.from
        })

        // get deposits amount
        if (getDeposits.data.data) {
            if (allDeposits.length > 0) {
                if (user.transactions.length > 0) {
                    const depositCount = await Transaction.countDocuments({ txnType: 'WALLET DEPOSIT' });

                    if (allDeposits.length > depositCount) {
                        let transactions;
                        user.transactions.forEach(async txn => {
                            let newTxn = await Transaction.findById(txn);
                            transactions.push(newTxn);
                        })
                        let deposits = transactions.filter(doc => {
                            return doc.txnType !== 'WALLET DEPOSIT'
                        })

                        let allReqIDs = []

                        allDeposits.forEach(newDeposit => {
                            allReqIDs.push(newDeposit.transaction_id)
                        })

                        deposits.forEach(async deposit => {

                            if (allReqIDs.includes(deposit.mountId) === false) {
                                console.log('a new deposit');

                                // get matching transaction
                                let newDepo = allDeposits.filter(doc => {
                                    return doc.transaction_id !== deposit.mountId
                                })

                                const send = await sendToWallet(user.privateKey, tronWeb.toSun(balance));


                                // save for each depo
                                newDepo.forEach(async depo => {
                                    // create new transaction

                                    const createTransaction = new Transaction({
                                        userId: user._id,
                                        amount: tronWeb.fromSun(depo.value),
                                        status: 'COMPLETED',
                                        txnType: 'WALLET DEPOSIT',
                                        mountId: depo.transaction_id || null,
                                        createdAt: moment(depo.block_timestamp).format('LLL'),
                                        time: moment(depo.block_timestamps).format('LTS'),
                                        date: moment(depo.block_timestamps).format('L')
                                    })

                                    try {
                                        const txnCreated = await createTransaction.save();
                                        user.wallet += tronWeb.fromSun(depo.value);
                                        user.transactions.push(txnCreated._id);
                                        await user.save()
                                    } catch (error) {
                                        console.log('error', error);
                                    }
                                })

                            } else console.log('already a deposit')
                        })
                    }

                } else {
                    const send = await sendToWallet(user.privateKey, getDeposits.data.data[0].value);
                    console.log('send to wallet', send)
                    // create new transaction
                    const createTransaction = new Transaction({
                        userId: user._id,
                        amount: tronWeb.fromSun(getDeposits.data.data[0].value),
                        status: 'COMPLETED',
                        txnType: 'WALLET DEPOSIT',
                        mountId: getDeposits.data.data[0].transaction_id,
                        createdAt: moment(getDeposits.data.data[0].block_timestamp).format('LLL'),
                        time: moment(getDeposits.data.data[0].block_timestamps).format('LTS'),
                        date: moment(getDeposits.data.data[0].block_timestamps).format('L')
                    })

                    try {
                        const txnCreated = await createTransaction.save();

                        user.wallet += tronWeb.fromSun(getDeposits.data.data[0].value);
                        user.transactions.push(txnCreated._id);
                        await user.save()
                    } catch (error) {
                        console.log('error', error);
                    }
                }
            } else {
                console.log('no deposit at all')

            }
        }

        const { privateKey, password, escrow, ...info } = user.toJSON()
        res.status(200).send(info)
    } else {
        res.status(404).send({
            message: 'User not found',
            error: null
        })
    }
}




const LoginUser = async (req, res) => {
    const data = await login_service(req.body.email, req.body.password)
    const { privateKey, password, escrow, ...info } = data
    res.status(200).send(info)
}

const verifyUser = async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    } else {
        const data = await verifyUserWithOtp(user._id)
        // Encrypt
        let encryptedOTP = CryptoJS.AES.encrypt(data.otp, 'bitlav').toString();

        res.status(200).send({
            success: true,
            otp: encryptedOTP,
            message: 'OTP Sent successfully'
        })
    }
}

const verifyOTPsent = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({ email: email });

    if (user.verified === false) {
        user.verified = true;
        user.save();

        res.send({
            message: "User verified Successfully",
            errorMsg: "OK"
        })
    } else res.send({
        message: "User already verified",
        errorMsg: "False"
    })
}

const changeUserPassword = async (req, res) => {
    const user = await User.findById(req.user);
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    } else {
        const data = await changePwd(req.body.password, user._id)
        res.status(200).send(data)
    }
}

const updateUserFields = async (req, res) => {
    const user = await User.findById(req.user);
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    } else {
        const data = await updateUser(req.body.firstname, req.body.lastname, user._id)
        res.status(200).send({
            success: true,
            message: 'Updated Successfully',
            userData: data
        })
    }
}

const resetPassword = async (req, res) => {
    const data = await resetPwd(req.body.email)
    res.send(data)
}


module.exports = {
    CreateUser,
    getUser,
    LoginUser,
    verifyUser,
    updateUserFields,
    changeUserPassword,
    verifyOTPsent,
    resetPassword
}