const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        verified: {
            type: Boolean,
            required: true,
        },
        // auth data
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        // personal information
        username: {
            type: String,
            required: false
        },
        fname: {
            type: String,
            required: false
        },
        lname: {
            type: String,
            required: false
        },
        // affiliate data
        userRefferedBy: {
            type: String,
            required: false
        },
        referralCode: {
            type: String,
            required: true
        },
        referrals: {
            type: Array,
            required: true
        },
        referralEarnings: {
            type: Number,
            required: true
        },
        // wallet and investments
        blockchainAddress: {
            type: String,
            required: true,
            unique: true
        },
        privateKey: {
            type: String,
            required: true,
            unique: true
        },

        packages: {
            type: Array,
            required: true,
        },
        currentPackage: {
            type: String,
            required: true
        },
        wallet: {
            type: Number,
            required: true
        },
        escrow: {
            type: Number,
            required: true
        },
        investmentBalance: {
            type: Number,
            required: true
        },
        todayEarnings: {
            type: Number,
            required: true
        },
        transactions: {
            type: Array,
            required: true,
        },
        dateJoined: {
            type: String,
            required: true
        },
        newUser: {
            type: Boolean,
            required: true
        }
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;