
const User = require('../../models/user.model');
const Referral = require('../../models/referral.model');
const bcrypt = require('bcrypt');

const generateCode = length => {
    let amount = Number(String(1).padEnd(length, '0'))
    return Math.floor(amount  + Math.random() * 90000).toString();
}


const run_service = async (currentDate, body) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(body.password.toString(), salt);
    //tronWeb
    const TronWeb = require('tronweb')
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider("https://api.trongrid.io");
    const solidityNode = new HttpProvider("https://api.trongrid.io");
    const eventServer = new HttpProvider("https://api.trongrid.io");
    const privateKey = process.env.ACC_PRIVATE_KEY;
    const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
    
    
    async function createUserAccount() {
        const tronConnection = await tronWeb.isConnected();
        const createUserAccount = await tronWeb.createAccount();

        let privateKey, address

        if(tronWeb.isAddress(createUserAccount.address.base58) === true) {
            address = createUserAccount.address.base58,
            privateKey = createUserAccount.privateKey
        } else {
            return 'Error in creating Account'
        }

        let data = {
            verified: false,
            username: null,
            password: hashedPin,
            email: body.email,
            fname: body.firstname,
            lname: body.firstname,

            userRefferedBy: body.referralCode,
            referrals: [],
            referralEarnings: 0,
            referralCode: generateCode(5),

            packages: [
                'Starter'
            ],
            currentPackage: 'Starter',
            wallet: 0,
            escrow: 0,
            investmentBalance: 0,
            transactions: [],
            privateKey: privateKey,
            blockchainAddress: address,
            dateJoined: currentDate
        };

        const user = new User(data)
        try {
            const result = await user.save();

            if (body.referralCode) {
                //handle new refferrals
                const referringUser = await User.findOne({referralCode: body.referralCode})
                const referral = new Referral({
                    userReffered: result.referralCode,
                    userReffering: referringUser.referralCode,
                    referralEarnings: 0,
                    dateReffered:  currentDate
                })
                const refferalSaved = await referral.save()

                referringUser.referrals.push(refferalSaved._id);
                const userSettingSaved = await referringUser.save();

            }

            return {
                success: true,
                error: null,
                message: 'Account created successfully'
            }
        } catch (error) {
            return {
                success: false,
                error: error,
                message: 'Error while creating account',
            }
        }
    }

    


    //handle errors
    let alreadyUserWithEmail = await User.findOne({email: body.email})

    if (alreadyUserWithEmail !== null ) {
        if (alreadyUserWithEmail.email === body.email) {
            return {
                success: false,
                message: 'An account with email already exist. Please try logging in again.',
                errorMsg: "Match"
            }
        } else {
            const creating = createUserAccount()
            return creating
        }
    } else  {
        const creating = createUserAccount()
        return creating
    }

}

module.exports = run_service;