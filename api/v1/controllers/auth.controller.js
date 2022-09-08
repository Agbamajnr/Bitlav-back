//models
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const axios = require('axios');

const moment = require('moment');
let time = moment().format('LTS')
let date = moment().format('L')
let currentDate = moment().format('LLL')
const CryptoJS = require("crypto-js");

console.log('deposit data', moment(1662532908000).format('LTS'))


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
const privateKey = '6812633245de403410cdaa7b5324853d9a9e99cc496715a06a528dd64f68ce31';


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


        
        if (balance > 10) {
            const send = await sendToWallet(user.privateKey, balance);
        }


        // check for new deposits

        let validDeposit = false
        let depositTxns = []
        user.transactions.forEach(async trans => {
            let trans_s = trans.toString()
            const txn = await Transaction.findById(trans_s)
            if (txn) {
                if (txn.txnType === 'WALLET DEPOSIT') {
                    validDeposit = true
                    depositTxns.push(txn.mountId)
                }
            } else {
                validDeposit  = true
            }
        })

        const getDeposits = await axios.get(`https://api.trongrid.io/v1/accounts/${tronWeb.address.toHex(user.blockchainAddress)}/transactions/trc20`)

        if (validDeposit) {
            getDeposits.data.data.forEach(deposit => {
                let blockTxn = []

                blockTxn.push(deposit.transaction_id)
                depositTxns.forEach(async dtxn => {
                    if (!blockTxn.includes(dtxn) || blockTxn === null || dtxn === null) {


                        const createTransaction = new Transaction({
                            userId: user._id,
                            amount: tronWeb.fromSun(deposit.value),
                            status: 'COMPLETED',
                            txnType: 'WALLET DEPOSIT',
                            mountId: deposit.transaction_id,
                            createdAt: moment(deposit.block_timestamp).format('LLL'),
                            time: moment(deposit.block_timestamps).format('LTS'),
                            date: moment(deposit.block_timestamps).format('L')
                        })

                        try {
                            const txnCreated = await createTransaction.save();
                            user.wallet = balance;
                            user.transactions.push(txnCreated._id);
                            await user.save()
                        } catch (error) {
                            console.log(error);
                        }
                    }
                })
            })
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