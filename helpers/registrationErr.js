//handle errors
function validateUsername() {
    if (alreadyUserWithUsername !== null) {
        return {
            success: false,
            message: 'This username has already been taken. Try using another one',
            errorMsg: "USN"
        }
    } else {
        validateEmail()
    }
}


function validateEmail() {
    if (alreadyUserWithEmail !== null) {
        return {
            success: false,
            message: 'This email has already been taken. Try using another one',
            errorMsg: "EMA"
        }
    } else createUserAccount()
}



let alreadyUserWithUsername = await User.findOne({username: req.body.username})
let alreadyUserWithEmail = await User.findOne({email: req.body.email})

if (alreadyUserWithEmail && alreadyUserWithUsername !== null ) {
    if (alreadyUserWithUsername.email === alreadyUserWithEmail.email) {
        return{
            message: 'An account with matching details already exist. Please try logging in again.',
            errorMsg: "Match"
        }
    } 
} else validateUsername()