//models
const User = require('../models/user.model');

const moment = require('moment');
let currentDate = moment().format("MMM Do YYYY");
const CryptoJS = require("crypto-js");


// services
const run_service = require('../services/Auth/createUser.service');
const login_service = require('../services/Auth/loginUser.service');
const updateUser = require('../services/Auth/updateUser.service');
const verifyUserWithOtp = require('../services/Auth/verifyUser.service');
const changePwd = require('../services/Auth/changePassword.service');
const resetPwd = require('../services/Auth/resetPassword.service');


const CreateUser = async (req, res) => {
    const data = await run_service(currentDate, req.body);
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
    const user = await User.findOne({email: req.body.email })
    if (!user) {
        return res.status(400).json({error: "User not found"})
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

    const user = await User.findOne({email: email});

    if (user.verified === false) {
        user.verified = true;
        user.save();

        res.send({
            message: "User verified Successfully",
            user: user,
            errorMsg: "OK"
        })
    } else res.send({
        message: "User already verified",
        user: user,
        errorMsg: "False"
    })
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
        const data = await updateUser(req.body.firstname, req.body.lastname,  user._id)
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