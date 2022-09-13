
const mongoose = require('mongoose')

const txnSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
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
        required: false,
        unique: true
    },
    fee: {
        type: Number,
        required: false
    },
    createdAt: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Transaction', txnSchema)