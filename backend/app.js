import express from 'express'
import dotenv from 'dotenv'

dotenv.config();

const app= express();
const PORT= process.env.PORT || 5000



app.get('/', (req,res)=>{
    res.send("<h1> this is from backend  </h1>")
})

app.listen(PORT, ()=>{
    console.log(`server is runing on ${PORT}`)
} )