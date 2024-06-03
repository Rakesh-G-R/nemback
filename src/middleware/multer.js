import multer from "multer";
export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/'); 
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });