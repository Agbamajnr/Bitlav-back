// models
const User = require('../models/user.model');
const otpCode = require('../models/otp.model');

// helpers
const generateCode = require('../helpers/generateCode');

async function verifyUserWithOtp(id) {
    const otp = String(generateCode(5));

    let previousOTP = await otpCode.findOne({userId: id})
    let result;

    if (previousOTP !== null) {
        result = previousOTP;
        return result;
    } else {
        
        const otpVerification = new otpCode({
            userId: id,
            otp: otp,
            createdAt: new Date(),
            expiresAt: new Date() + 36000,
        }) 
    
        result = await otpVerification.save()
        return result;
    }
}

module.exports = verifyUserWithOtp