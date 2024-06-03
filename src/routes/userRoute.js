import { Router } from "express";
import { USER } from "../model/userSchema.js";
import bcrypt from 'bcrypt';
import  jwt from 'jsonwebtoken'
import { config } from "dotenv";
import { BLOCK } from "../model/tokenblock.js";


config();

export const userRoute=Router();

userRoute.post('/register',async(req,res)=>{
    let{userName,email,password,role}=req.body;
   try{
      const exuser=await USER.findOne({email});
      if(exuser){
        return res.status(302).send("User already registerd try to login")
      }
      
          bcrypt.hash(password,10,async(err,result)=>{
            if(err)console.log(err);
            const user=new USER({userName,email,password:result,role});
            await user.save()
           return  res.status(201).send("user registered successfully")
          })
   }
   catch(err){
    console.log(err);
   }
})


userRoute.post("/login",async(req,res)=>{
    let{email,password}=req.body;
    try{
        const exuser=await USER.findOne({email});
        if(!exuser){
            return res.status(401).send("User not found")
        }
        const payload={id:exuser._id,email:exuser.email,role:exuser.role};
        bcrypt.compare(password,exuser.password,(err,result)=>{
            if(err)console.log(err);
            if(!result){
               return res.status(203).send("wrong credential");
            }
            jwt.sign(payload,process.env.JWT_SEACRET,(err,token)=>{
                if(err){console.log(err);}
                else{
                    res.status(200).json({token:token})
                }
            })
        })
    }catch(err){
        console.log(err)
    }
})


userRoute.post("/logout",async(req,res)=>{
    if(req.headers.authorization===undefined){
        return res.send("token reqired");
    }
      let token=req.headers.authorization.split(" ")[1];
      console.log(token)
    try{
            const block=new BLOCK({blocklist:token})
            await block.save();
            res.send('User logged out');
    }catch(err){
      console.log(err);
    }
})

