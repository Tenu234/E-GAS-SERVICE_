
import 'dotenv/config';
//G-jNizYvkjdk28F

const express = require ("express");
const mongoose = require ("mongoose");

const app= express();

//middlware
app.use("/",(req,res,next)=>{

    res.send("it is working");

})
mongoose.connect("mongodb+srv://Admin:G-jNizYvkjdk28F@cluster0.jgcnv63.mongodb.net/Egas")
.then(()=>console.log("connected to MongoDB"))
.then(()=>{
    app.listen(5000);


})
.catch((err)=>console.log((err)));
