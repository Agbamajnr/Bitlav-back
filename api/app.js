const express = require('express');
const app = express();

const mountApp = require('./v1/mount-app');

mountApp(app);

// Manage user earnings daily

const User = require('./v1/models/user.model');
const Referral = require('./v1/models/referral.model')


// update user account daily
setInterval(async () => {
    const allUsers = await User.find();
    allUsers.forEach(async (user) => {
        if (user.currentPackage !== 'Starter') {

            user.wallet += user.todayEarnings;
            await user.save()

            // share package interest to team;
            let parentReferral, grandParent, greatGrandParent;
            // link affiliate team
            if (user.userRefferedBy.length > 3) {
                parentReferral = await Referral.findOne({ userReffering: user.userRefferedBy });
                console.log(parentReferral)
                if (parentReferral !== null) {
                    const parent = await User.findOne({ userReffering: parentReferral.userReffered });
                    parent.wallet += calcPercentage(user.todayEarnings, 0.2)
                    // save to referral model
                    parentReferral.referralEarnings += calcPercentage(user.todayEarnings, 0.2)
                    await parentReferral.save()
                    await parent.save()

                    // share to grand parents
                    if (parent.userRefferedBy.length > 3) {
                        grandParent = await Referral.findOne({ userReffering: parent.userRefferedBy });
                        if (grandParent !== null) {
                            const grandRf = await User.findOne({ userReffering: grandParent.userReffered });
                            grandRf.wallet += calcPercentage(user.todayEarnings, 0.130)

                            grandParent.referralEarnings += calcPercentage(user.todayEarnings, 0.130)
                            await grandParent.save()
                            await grandRf.save()

                            // share to grand parents
                            if (grandRf.userRefferedBy.length > 3) {
                                greatGrandParent = await Referral.findOne({ userReffering: grandRf.userRefferedBy });
                                if (greatGrandParent !== null) {
                                    const greatGrandRf = await User.findOne({ userReffering: greatGrandParent.userReffered });
                                    greatGrandRf.wallet += calcPercentage(user.todayEarnings, 0.07)

                                    greatGrandParent.referralEarnings += calcPercentage(user.todayEarnings, 0.2)
                                    await greatGrandParent.save()
                                    await greatGrandRf.save()
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}, 86400000);

// update day earnings every 5 sec
setInterval(async () => {
    const allUsers = await User.find();
    allUsers.forEach(async (user) => {
        if (user.currentPackage !== 'Starter') {
            let currentPackage = user.packages.filter(plan => {
                return user.currentPackage === plan.name
            })

            let dailyReward = currentPackage.amountInvested * currentPackage.dailyReturns / 100;

            let sec5Reward = dailyReward / 17280;
            console.log(dailyReward, sec5Reward);
            user.todayEarnings += sec5Reward;
            await user.save();
        }
    })
}, 5000);

module.exports = app;