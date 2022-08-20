const User = require('../../models/user.model');
const Referral = require('../../models/referral.model');

const getRf = async (id) => {
    const referral = await Referral.findById(id);
    const user = await User.findOne({referralCode: referral.userReffered});
    if(!referral) {
        return {
            success: false,
            message: 'Referral not found'
        }
    } else {
        return {
            success: true,
            userDetails: {
                fname: user.fname,
                lname: user.lname,
                dateJoined: user.dateJoined,
                packagesCount: user.packages.length,
                referralCount: user.referrals.length,
            },
            referralDetails: referral
        }
    }
    
}

module.exports = getRf;