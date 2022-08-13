const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const changePwd = async (pwd, userId) => {
    const user = await User.findById(userId);

    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(pwd.toString(), salt);

    user.password = hashedPwd;

    try {
        const result = await user.save();
        return {
            success: true,
            error: null,
            message: 'Password change Successful'
        }
    } catch (error) {
        return {
            success: false,
            error: result,
            message: 'Error while changing password',
        }
    }
}

module.exports = changePwd