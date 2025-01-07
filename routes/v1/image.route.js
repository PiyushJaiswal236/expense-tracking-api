const express = require("express");
const router = express.Router();
const {getbucket} = require("../../config/database");
const mongoose = require("mongoose");


router.get("/:fileId", async (req, res) => {
    try {
        const bucket = getbucket();
        const {fileId} = req.params;
        // Check if file exists
        const file = await bucket.find({_id: new mongoose.Types.ObjectId(fileId)}).toArray();
        if (file.length === 0) {
            return res.status(404).json({error: {text: "File not found"}});
        }

        // set the headers
        res.set("Content-Type", file[0].contentType);
        res.set("Content-Disposition", `attachment; filename=${file[0].filename}.${file[0].contentType.split('/')[1]}`);

        // create a stream to read from the bucket
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
        // pipe the stream to the response
        downloadStream.pipe(res);
    } catch (error) {
        res.status(400).json({error: {text: `Unable to 
        download file`, error}});
    }
});

module.exports = router;
