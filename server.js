const express = require('express');
const cors = require('cors');
const app = express();
const userRoute = require('./Routes/user');
const categoryRoute = require('./Routes/category');
const cartRoute = require('./Routes/cart');
const shopRoute = require('./Routes/shop');
const mallRoute = require('./Routes/mall');
const upload = require('./Routes/upload');
const productRoute = require('./Routes/product');
const multer = require('multer');
const uploader = multer({ dest:`products/`})

const HOST = "0.0.0.0";

const PORT = process.env.PORT || 4200; 

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
app.use('/upload',uploader.single("file"), upload);

app.listen(PORT, HOST, ()=>{
    console.log('server is listening to port ', PORT);
})

