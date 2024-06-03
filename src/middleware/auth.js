import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { BLOCK } from "../model/tokenblock.js";

config();

export const auth=(role)=>{
    
    return async(req,res,next)=>{
        try{
         if(req.headers.authorization===null){
              return res.status(203).send('token required');
         }
         const token=req.headers.authorization.split(" ")[1];

        const block= await BLOCK.find({token})
        if(block){
            res.status(500).send("Invalid token");
        }
         
         jwt.verify(token,process.env.JWT_SECRET,(err,decode)=>{
            if(err)console.log(err);
          
            req.user=decode;
            if(role.includes(decode.role)){
                next();
            }
            else{
              return res.status(403).send("User does not access to this operation")
            }
          
         })
        }catch(err){
            console.log(err);
        }
    }
}