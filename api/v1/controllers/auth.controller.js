//models
const User = require('../models/user.model');

const moment = require('moment');
let currentDate = moment().format("MMM Do YYYY");
const CryptoJS = require("crypto-js");


// services
const run_service = require('../services/createUser.service');
const login_service = require('../services/loginUser.service');
const updateUser = require('../services/updateUser.service');
const verifyUserWithOtp = require('../services/verifyUser.service');
const changePwd = require('../services/changePassword.service');


const CreateUser = async (req, res) => {
    const data = await run_service(currentDate, req.body.password, req.body.email, req.body.rfCode);
    if(data.success !== false) {
        const {password, ...info} = data;
        res.status(201).send(info);
    } else {
        res.status(201).send(data);
    }
}


const getUser =  async (req, res) => {
    const user = await User.findById(req.user._id);
    const {password, ...info} = user.toJSON()
    res.status(200).send(info)
}


const LoginUser = async (req, res) => {
    const data = await login_service(req.body.email, req.body.password)
    const {password, ...info} = data
    res.status(200).send(info)
}

const verifyUser = async (req, res) => {
    const user = await User.findById(req.body.id)
    if (!user) {
        return res.status(400).json({error: "User not found"})
    } else {
        const data = await verifyUserWithOtp(user._id)
        // Encrypt
        let encryptedOTP = CryptoJS.AES.encrypt(data.otp, 'bitlav').toString();

        // // Decrypt
        // let bytes  = CryptoJS.AES.decrypt(encryptedOTP, 'bitlav');
        // var originalText = bytes.toString(CryptoJS.enc.Utf8);

        res.status(200).send({
            success: true,
            otp: encryptedOTP,
            message: 'OTP Sent successfully'
        })
    }
}

const changeUserPassword = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(400).json({error: "User not found"})
    } else {
        const data = await changePwd(req.body.password, user._id)
        res.status(200).send(data)
    }
}

const updateUserFields = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(400).json({error: "User not found"})
    } else {
        const data = await updateUser(req.body.firstname, req.body.lastname, req.body.email, user._id)
        res.status(200).send({
            success: true,
            message: 'Updated Successfully',
        })
    }
}


module.exports = {
    CreateUser,
    getUser,
    LoginUser,
    verifyUser,
    updateUserFields,
    changeUserPassword
}