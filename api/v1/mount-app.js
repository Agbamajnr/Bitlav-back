const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const AuthenticationRoute = require('./routes/auth.route.js')

const app = express();

module.exports = function mountApp(app) {

  app.use(cors({
    credentials: true,
    origin: ['https://bitlav.netlify.app', 'http://localhost:8080', 'http://localhost:8080']
  }));
  
  app.use(express.json());


  app.on('error', (err) => {
    console.log('err',err);
  });



  app.use(morgan('dev'));

  app.get('/', (_req, res) =>
    res.json({
      status: true,
      message: 'BITLAV APIs RUNNING',
    }),
  );

  app.use('/api/auth', AuthenticationRoute)
};