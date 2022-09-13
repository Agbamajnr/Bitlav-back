const User = require('../../models/user.model');
const cloudinary = require('cloudinary').v2;  

const profileImg = async (req, id) => {
    const user = await User.findById(id);

    const file = req.files.photo;  

    cloudinary.uploader.upload(file.tempFilePath, 
        { 
            public_id: `users/${user._id}`, 
            eager: [
                { width: 150, height: 150, crop: "crop", gravity: "center"} 
            ],
        }, 
        async (err, result) => {
        if (err) {
            return {
                success: false,
                message: 'An error occured'
            }
        } else {
            user.userImage = result.secure_url;
            await user.save()
            return {
                success: true,
                message: 'Profile picture saved',
            }
        }
    })
}


module.exports = profileImg