const express = require('express');
const cors = require('cors');
const app = express();
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req,res)=>{
    res.send("E-Mall backend running");
});


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
    console.log('server is listening to port http://localhost:', PORT);
})

