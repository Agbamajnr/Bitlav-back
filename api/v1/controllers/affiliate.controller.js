const moment = require('moment');
let currentDate = moment().format("MMM Do YYYY");

const Referral = require('../models/referral.model');

// services
const getRf = require('../services/Affiliate/getReferral.service');

const getReferral = async (req, res) => {
    const data = await getRf(req.body.id)
    res.send(data)
}


module.exports = {
    getReferral
}