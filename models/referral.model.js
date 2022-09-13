
const mongoose = require('mongoose')

const referralSchema = new mongoose.Schema({
    userReffered: {
        type: String,
        required: true
    },
    userReffering: {
        type: String,
        required: true
    },
    referralEarnings: {
        type: Number,
        required: true
    },
    dateReffered: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Referral', referralSchema)