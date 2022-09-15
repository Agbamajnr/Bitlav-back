const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    publicId: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    createdAt: Date,
    timeCreated: String,
    dateCreated: String,
})

module.exports = mongoose.model('Ticket', ticketSchema)