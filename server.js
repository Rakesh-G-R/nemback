import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import { connecttodb } from './src/config/db.js';
import { userRoute } from './src/routes/userRoute.js';
import { pdfRouter } from './src/routes/pdfgenerator.js';
import multer from 'multer';


config();

const app=express();

app.use(express.json());
app.use(cors());
app.use('/public', express.static('public'));





const port=process.env.PORT||9090;
const uri=process.env.URI||null;

app.use(cors());

app.use('/pdfgen', pdfRouter)

app.listen(port,async()=>{
    try{
      await connecttodb(uri);
      console.log('Database connected successfully');
      console.log(`server running at the port number ${port}`);
    }
    catch(err){
        console.log(err);
    }
})
