const mongoose = require('mongoose')

const withdrawSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    txId: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Withdraw', withdrawSchema)