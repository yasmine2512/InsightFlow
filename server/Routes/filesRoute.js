import express from "express"
import asyncHandler from "express-async-handler";
import File from "../Models/File.js";
import User from "../Models/User.js";
import { cloudinary , uploadFile } from "../Middlewares/Multer.js";
import { verifyTokenAndAuthorization } from "../Middlewares/JWTauth.js";

const router = express.Router()

/** 
   * @desc get organizations file
   * @route /api/files/:id
   * @method GET
   * @access private
   */  
router.get("/:id",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgId = req.params.id;
const files = await File.find({organization:orgId});
return res.status(200).json(files);
}))

/** 
   * @desc  upload a file
   * @route /api/files/:id
   * @method POST
   * @access private
   */  
router.post("/:id",verifyTokenAndAuthorization,(req, res, next) => {
    uploadFile.single("file")(req, res, (err) => {
      if (err) {
        console.error("Upload middleware error:", err);
         if (
        error.message?.toLowerCase().includes("password-protected") ||
        error.message?.toLowerCase().includes("password protected")
    ) {
        return res.status(400).json({
            message: "Password-protected PDFs are not supported. Please upload an unlocked PDF.",
        });
    }
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "File is too large. Maximum file size is 10 MB.",
          });
        }

        return res.status(400).json({
          message: err.message || "File upload failed.",
        });
      }

      next();
    });
  },
  asyncHandler(async (req, res) => {
const orgId = req.params.id;
if (!req.file) {
            return res.status(400).json({
                message: "No file provided",
            });
        }
try{
const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        {
            folder: "uploads",
            resource_type: "raw",
            public_id: `${Date.now()}-${req.file.originalname}`,
        },
        (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }
    );

    stream.end(req.file.buffer);
});
const file = new File({
    organization: orgId,
    name: req.file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    size: req.file.size,
    }
);
await file.save();
 return res.status(201).json({message: "File uploaded successfully",file});
} catch (error) {
  console.error("PDF upload error:",JSON.stringify(error, null, 2));
return res.status(500).json({message: error.message || "Failed to upload file"});
}
}))


/** 
   * @desc  delete a file
   * @route /api/files/:id
   * @method DELETE
   * @access private
   */ 
router.delete("/:id/file/:fileId",verifyTokenAndAuthorization,asyncHandler(async(req,res)=>{
const orgId = req.params.id;
const fileId = req.params.fileId;
const file = await File.findOne({_id: fileId, organization: orgId});
if(!file){
    return res.status(404).json({message: "File not found"});
}

try{
   await cloudinary.uploader.destroy(file.publicId, {resource_type: "raw"});
  await file.deleteOne();
}
catch(error){
  console.log(error);
  return res.status(400).json({message:`Error during deleting file : ${error}`});
}
return res.status(200).json({message:"File deleted successfully"});
}))

export default router;
