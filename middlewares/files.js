const multer = require("multer");
const mongoose = require("mongoose");
const GridFSBucket = require("mongodb").GridFSBucket;
const { run, getBucket } = require('../config/database'); // Assuming this initializes your database connection and bucket

// Initialize storage for multer (memory storage to process files manually)
const storage = multer.memoryStorage();

// Initialize multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
    fileFilter: (req, file, cb) => {
        // Validate file type
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type! Only images are allowed."));
        }
    },
});

const saveToGridFS = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            console.log("Request does not have file");
            console.log("Proceeding without uploading");
            next();
        }

        const bucket = getBucket();

        // Create an upload stream to GridFS
        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype,
        });

        // Write the file buffer to GridFS
        uploadStream.end(file.buffer);

        // Handle completion
        uploadStream.on("finish", () => {
            req.fileId = uploadStream.id;
            req.file.id = uploadStream.id;
            next();
        });

        // Handle errors
        uploadStream.on("error", (error) => {
            throw new Error("Failed to upload file to GridFS: " + error.message);
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { upload, saveToGridFS };
