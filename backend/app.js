import express from 'express'
import dotenv from 'dotenv'
import connectDB from "./config/db.js"

import userRoute from './routers/user.js'
import taskRoute from './routers/task.js'

dotenv.config();
connectDB();
const app= express();
const PORT= process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.get('/', (req,res)=>{
    res.send("<h1> this is from backend  </h1>") 
})


app.use('/user' , userRoute)
app.use('/task' , taskRoute)


app.listen(PORT, ()=>{
    console.log(`server is runing on ${PORT}`)
} )