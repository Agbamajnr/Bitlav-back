const generateCode = (length => {
    let amount = Number(String(1).padEnd(length, '0'))
    return Math.floor(amount  + Math.random() * 90000).toString();
})


module.exports = generateCode