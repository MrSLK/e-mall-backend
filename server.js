const express = require('express');
const cors = require('cors');
const app = express();
const userRoute = require('./Routes/user');

const baseUrl = "0.0.0.0";

const PORT = process.env.PORT || 4200; 

const corsOptions = {origin: '*'}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req,res)=>{
    res.send("E-Mall backend running");
});


app.use('/user', userRoute);

app.listen(PORT, HOST, ()=>{
    console.log('server is listening to port ', PORT);
})

