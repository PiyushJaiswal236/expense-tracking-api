const express = require("express");
const router = express.Router();
const {getbucket} = require("../../config/database");
const mongoose = require("mongoose");
const {getImage, deleteImage} = require("../../services/image.service");
const catchAsync = require("../../utils/CatchAsync");
const {upload, saveToGridFS} = require("../../middlewares/files");
const {json} = require("express");
const httpStatus = require("http-status");
const auth = require("../../middlewares/auth");


// router.get("/:fileId", async (req, res) => {
//
// });

router.get("/:id", auth('user'), catchAsync(async (req, res) => {
    const {id} = req.params;
    try {
        await getImage(id, res);
    } catch (error) {
        res.status(error.statusCode || 500).send(error.message);
    }
}));

router.post("/upload",auth('user'), upload.single("file"), saveToGridFS, async (req, res) => {
    res.status(httpStatus.CREATED).json({body: req.body, fileId: req.fileId});
})


router.delete("/image/:id", auth('user'),catchAsync(async (req, res) => {
    const {id} = req.params;
    try {
        await deleteImage(id);
        res.status(200).send({message: "File deleted successfully."});
    } catch (error) {
        res.status(error.statusCode || 500).send(error.message);
    }
}));

module.exports = router;
