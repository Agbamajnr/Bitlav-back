const moment = require('moment');
let currentDate = moment().format("MMM Do YYYY");

const Referral = require('../models/referral.model');
const User = require('../models/user.model');

// services
const getRf = require('../services/Affiliate/getReferral.service');

const getReferral = async (req, res) => {
    const data = await getRf(req.body.id)
    res.send(data)
}

const globalRankings = async(req, res) => {
    const allRankings = await User.find()
    allRankings.sort((a, b) => {
        return b.referrals.length - a.referrals.length;
    })
    let sanitizedRankings = [];
    
    allRankings.forEach(async rank => {
        let teamEarnings = 0
        if(rank.referrals.length > 0) {
            let referrals = await Referral.find({userReffering: rank.userReffering});
            referrals.forEach(async referral =>  {
                teamEarnings += referral.referralEarnings
            })
        }
        let obj = {
            name: rank.fname + ' ' + rank.lname,
            joiningDate: rank.dateJoined,
            packagesCount: rank.packages.length,
            amountEarned: rank.referralEarnings,
            teamEarnings: teamEarnings
        }
        sanitizedRankings.push(obj)
    })
    res.send({
        rankings: sanitizedRankings
    })
}
module.exports = {
    getReferral,
    globalRankings
}