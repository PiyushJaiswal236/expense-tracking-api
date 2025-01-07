const multer = require("multer");
const {GridFsStorage} = require('multer-gridfs-storage');
const config = require('../config/config');

const storage = new GridFsStorage({
    url: config.mongoose.url,
    file: (req, file) => {
        console.log(req);
        console.log(file);
        return {
            fileName: file.originalname,
            bucketName: 'uploads',
        }
    }
});
const upload = multer({storage: storage});

module.exports = upload;