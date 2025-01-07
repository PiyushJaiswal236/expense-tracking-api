const {getGFS, getbucket} = require("../config/database");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const uploadImage = async (file) => {
    return file;
}

const getImage = async (id, res) => {
    try {
        const GFS = getGFS()
        await GFS.files.findOne({id: id}, (err, file) => {
            if (!file || file.length === 0) {
                return ApiError(httpStatus.NOT_FOUND, 'No file exists')
            }
            const readStream = GFS.createReadStream(file._id)
            readStream.pipe(res);
        });
    } catch (error) {
        console.log(error);
        return ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to upload file')
    }
}
const deleteImage = async (id) => {
    const bucket = getbucket();
    const item = await bucket.delete(id);
    console.log("in image service")
    console.log(item);
    return item;
}
module.exports = {
    getImage,
    uploadImage,
    deleteImage,
}