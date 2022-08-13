
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const generateCode = length => {
    let amount = Number(String(1).padEnd(length, '0'))
    return Math.floor(amount  + Math.random() * 90000).toString();
}


const run_service = async (currentDate, password, email, rfCode) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(password.toString(), salt);
    //tronWeb
    const TronWeb = require('tronweb')
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider("https://api.shasta.trongrid.io");
    const solidityNode = new HttpProvider("https://api.shasta.trongrid.io");
    const eventServer = new HttpProvider("https://api.shasta.trongrid.io");
    const tronWeb = new TronWeb(fullNode,solidityNode,eventServer);

    
    
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
            email: email,
            fname: null,
            lname: null,

            userRefferedBy: rfCode,
            referrals: [],
            referralEarnings: 0,
            referralCode: generateCode(5),

            packages: [
                'Starter'
            ],
            currentPackage: 'Starter',
            wallet: 0,
            privateKey: privateKey,
            blockchainAddress: address,
            dateJoined: currentDate
        };

        const user = new User(data)
        try {
            const result = await user.save();
            return {
                success: true,
                error: null,
                message: 'Account created successfully'
            }
        } catch (error) {
            return {
                success: false,
                error: result,
                message: 'Error while creating account',
            }
        }
    }

    


    //handle errors
    let alreadyUserWithEmail = await User.findOne({email: email})

    if (alreadyUserWithEmail !== null ) {
        if (alreadyUserWithEmail.email === email) {
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