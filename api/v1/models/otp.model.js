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
    expiresAt: Date
})

module.exports = mongoose.model('Otp', otpSchema)