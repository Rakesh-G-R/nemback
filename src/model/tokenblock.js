import { Schema,model } from "mongoose";

const blocklist=new Schema({
    blocklist:String
})

export const BLOCK=model('bocklist',blocklist);