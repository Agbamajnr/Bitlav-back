
const User = require('../../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login_service = async (email, password) => {
    const user = await User.findOne({email: email})
    

    if (!user) {
        return { message: 'user not found' }
    }

    if (!await bcrypt.compare(password.toString(), user.password)) {
        return { message: 'Invalid Credentials'}
    } else {
        const token = jwt.sign({_id: user._id}, "secret")
        const data = {
            message: 'Login Successful',
            user: user,
            token: token
        }

        return {
            data
        }
    }




}

module.exports = login_service;