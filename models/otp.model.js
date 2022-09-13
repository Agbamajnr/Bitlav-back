const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: Date,
    expireAt: {
        type: Date,
        default: new Date(),
        expires: 600,
    }
})

module.exports = mongoose.model('Otp', otpSchema)