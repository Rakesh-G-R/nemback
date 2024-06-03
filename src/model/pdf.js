import { Schema,model } from "mongoose";


const pdfSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  frontImagePath: { type: String },
  backImagePath: { type: String },
  content:{type:String },
  created_at: { type: Date, default: Date.now }
});

export const PDF=model('Pdf', pdfSchema);


