
const mongoose = require('mongoose')

const txnSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true
    },
    txnType: {
        type: String,
        required: true
    },
    mountId: {
        type: String,
        required: false
    },
    createdAt: Date,
})

module.exports = mongoose.model('Transaction', txnSchema)