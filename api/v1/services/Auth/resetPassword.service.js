const User = require('../../models/user.model');
const bcrypt = require('bcrypt');
const CryptoJS = require("crypto-js");


function generatePwd() {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var passwordLength = 12;
    var password = "";
    for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber +1);
    }

    return password;
}

const resetPwd = async (userEmail) => {
    const user = await User.findOne({email: userEmail});
    if(!user) {
        return {
            success: false,
            message: 'User not found',
        }
    } else {
        const password = generatePwd();

        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(password.toString(), salt);

        user.password = hashedPwd;
        const result = await user.save();
        
        if(result) {
            // Encrypt
            let encryptedPwd = CryptoJS.AES.encrypt(result.password, process.env.ENCRYPT_KEY).toString();
            return {
                success: true,
                password: encryptedPwd,
                message: 'Password reset successful',
            }
        } else {
            return {
                success: false,
                message: 'Server encountered an error',
            }
        }
    }
    
}

module.exports = resetPwd