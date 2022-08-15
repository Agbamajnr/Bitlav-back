const User = require('../models/user.model');

const updateUser = async (fname, lname,  id ) => {
    const user = await User.findById(id);

    user.fname = fname;
    user.lname = lname;

    const result = await user.save();
    return result;
}

module.exports = updateUser