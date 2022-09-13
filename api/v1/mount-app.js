const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const AuthenticationRoute = require('./routes/auth.route.js')
const AffiliateRoute = require('./routes/affiliate.route.js')
const FinanceRoute = require('./routes/finance.route.js')
const AdminRoute = require('./routes/admin.route.js')

// image processing
const fileupload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const app = express();

module.exports = function mountApp(app) {

  app.use(cors({
    origin: ['https://bitlav.netlify.app', 'http://127.0.0.1:5174', 'http://127.0.0.1:5173', 'https://bitlav.com', 'https://bitlav-admin.netlify.app']
  }));

  app.use(express.json());


  app.on('error', (err) => {
    console.log('err', err);
  });



  app.use(morgan('dev'));
  app.use(fileupload({
    useTempFiles: true
  }));

  cloudinary.config({
    cloud_name: 'agbamajnr',
    api_key: '499258712995133',
    api_secret: 'd-BeOXOkJg7OPSmei4sTxi4wZfI'
  });

  app.get('/', (_req, res) =>
    res.json({
      status: true,
      message: 'BITLAV APIs RUNNING',
    }),
  );

  app.use('/api/auth', AuthenticationRoute)
  app.use('/api/affiliate', AffiliateRoute)
  app.use('/api/finance', FinanceRoute)

  app.use('/api/admin', AdminRoute)
};