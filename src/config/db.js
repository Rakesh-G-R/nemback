import { connect } from "mongoose";

export const connecttodb=async(uri)=>{
     try{
        await connect(uri)  
     }catch(err){
        console.log(err);
     }
}