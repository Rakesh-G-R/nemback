import express from 'express';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { storage } from '../middleware/multer.js';
import { PDF } from '../model/pdf.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const pdfDoc = await PDFDocument.create({
  fontkit,
});

export const pdfRouter = express.Router();
const upload = multer({ storage: storage });

pdfRouter.use(express.text());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const fontPath = path.join(__dirname, '../../fonts/Roboto-Regular.ttf');
const fontBytes = fs.readFileSync(fontPath);


pdfRouter.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'bimage', maxCount: 1 }, { name: 'inter', maxCount: 1 }]), async (req, res) => {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const width = 595;
    const height = 842;
    const margin = 50; 

 
    const fontPath = path.join(__dirname, '../../fonts/Roboto-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);


    const frontPage = pdfDoc.addPage([width, height]);

    if (req.files['image']) {
      const frontImageBytes = fs.readFileSync(req.files['image'][0].path);
      const frontImage = await pdfDoc.embedPng(frontImageBytes);
      frontPage.drawImage(frontImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }

   
    const title = req.body.title || 'Title';
const titleSize = 30;
const titleWidth = customFont.widthOfTextAtSize(title, titleSize);
const maxTitleWidth = width - 2 * margin; 

let truncatedTitle = title;
if (titleWidth > maxTitleWidth) {

  const availableWidth = maxTitleWidth;
  let currentWidth = 0;
  let ellipsisAdded = false;
  
  for (let i = 0; i < title.length; i++) {
    const charWidth = customFont.widthOfTextAtSize(title[i], titleSize);
    if (currentWidth + charWidth <= availableWidth) {
      currentWidth += charWidth;
    } else {
      if (!ellipsisAdded) {
        truncatedTitle = title.slice(0, i) + '...';
        ellipsisAdded = true;
      }
      break;
    }
  }
}

const titleX = margin + (width - 2 * margin - customFont.widthOfTextAtSize(truncatedTitle, titleSize)) / 2; 
frontPage.drawText(truncatedTitle, { x: titleX, y: height - 100, size: titleSize, color: rgb(1, 0, 0), font: customFont });

    const author = req.body.author || 'Author';
    frontPage.drawText(`By ${author}`, { x: margin, y: height - 140, size: 20, font: customFont });

    let currentPage = pdfDoc.addPage([width, height]);
    let y = height - margin;
    const fontSize = 12;
    const lineHeight = fontSize * 1.2; 
    const contentWidth = width - 2 * margin;

    const textData = req.body.textData || '';
    const contentLines = textData.split('\n');

    for (let line of contentLines) {
      const lines = currentPage.drawText(line, { x: margin, y, size: fontSize, font: customFont, maxWidth: contentWidth });
      y -= 580 * lineHeight; 
      if (y < margin) {
        currentPage = pdfDoc.addPage([width, height]);
        y = height - margin;
      }
    }

    
    const backPage = pdfDoc.addPage([width, height]);

 
    if (req.files['bimage']) {
      const backImageBytes = fs.readFileSync(req.files['bimage'][0].path);
      const backImage = await pdfDoc.embedPng(backImageBytes);
      backPage.drawImage(backImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }

    backPage.drawText('Back Cover Content', { x: margin, y: height - 100, size: 20, font: customFont });

    const pdfBytes = await pdfDoc.save();
    const filePath = path.join(process.cwd(), 'uploads', 'output.pdf');

    fs.writeFileSync(filePath, pdfBytes);

    const newPDF = new PDF({
      title,
      author,
      textData,
      frontImagePath: req.files['image'] ? req.files['image'][0].path : null,
      backImagePath: req.files['bimage'] ? req.files['bimage'][0].path : null,
      internalImages: req.files['inter'] ? req.files['inter'][0].path : null,
    });
    await newPDF.save();

    res.send("/Evel-03/uploads/output.pdf");
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
