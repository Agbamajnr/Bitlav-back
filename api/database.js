const mongoose = require('mongoose')
const config = require('../config/config');

mongoose.connect(config.database.string, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(result => {
        console.log('connected');
    })
    .catch((err) => {
        console.log('err occured',err);
    });


module.exports = mongoose