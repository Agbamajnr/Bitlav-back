const config = require('./config/config')
const server = require('./api/app')
const { mongoose } = require('./api/database')


mongoose.connection.on('connected', () => {
    try {
        server.listen(config.port)
        console.log('Success in connecting to database');
    } catch (err) {
        console.log('Failed to Connect with Error', err)
    }
});