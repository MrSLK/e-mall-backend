const express = require('express');
const cors = require('cors');
const app = express();
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

const userRoute = require('./Routes/user');
const categoryRoute = require('./Routes/category');
const cartRoute = require('./Routes/cart');
const shopRoute = require('./Routes/shop');
const mallRoute = require('./Routes/mall');
const paymentRoute = require('./Routes/payment');
const productRoute = require('./Routes/product');
const adminReportRoute = require('./Routes/adminReport');
const orderHistoryRoute = require('./Routes/orderHistory');

const HOST = "0.0.0.0";

const PORT = process.env.PORT || 5000; 

const corsOptions = {origin: '*'}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req,res)=>{
    res.send("E-Mall backend running");
});

// or use es6 import statements
// import * as Sentry from '@sentry/node';

// or use es6 import statements
// import * as Tracing from '@sentry/tracing';

Sentry.init({
  dsn: "https://f11476ca0d274ad3a8f9207f97a039a3@o4504914879578112.ingest.sentry.io/4504914880757760",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: "test",
  name: "My First Test Transaction",
});

setTimeout(() => {
  try {
    foo();
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);


app.use('/user', userRoute);
app.use('/category', categoryRoute);
app.use('/mall', mallRoute);
app.use('/cart', cartRoute);
app.use('/shop', shopRoute);
app.use('/product', productRoute);
app.use('/payment', paymentRoute);
app.use('/product', productRoute);
app.use('/report', adminReportRoute);
app.use('/order', orderHistoryRoute);

app.listen(PORT, HOST, ()=>{
    console.log('server is listening to port http://localhost:' + PORT);
})

