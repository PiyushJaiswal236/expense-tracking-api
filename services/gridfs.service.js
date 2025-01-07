const { getGFS, getBucket } = require("../config/database");
const ApiError = require("../utils/ApiError");


/**
 * Upload an image (stubbed for now, actual implementation can vary).
 * @param {Object} file - The file object to upload.
 * @returns {Object} - The uploaded file details.
 */
const uploadImage = async (file) => {
    // Implement file upload logic if required
    return file;
};

/**
 * Retrieve an image by ID and stream it to the response.
 * @param {String} id - File ID.
 * @param {Object} res - Express response object.
 */
const getImage = async (id, res) => {
    try {
        const gfs = getGFS();

        gfs.files.findOne({ _id: id }, (err, file) => {
            if (err) {
                throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error retrieving file.");
            }

            if (!file) {
                throw new ApiError(httpStatus.NOT_FOUND, "File not found.");
            }

            const readStream = gfs.createReadStream({ _id: file._id });
            readStream.on("error", (streamErr) => {
                throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error streaming file.");
            });

            readStream.pipe(res);
        });
    } catch (error) {
        console.error(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Unable to retrieve file.");
    }
};

/**
 * Delete an image from GridFS by ID.
 * @param {String} id - File ID.
 */
const deleteImage = async (id) => {
    try {
        const bucket = getBucket();
        await bucket.delete(id);
        console.log("File deleted successfully.");
    } catch (error) {
        console.error(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Unable to delete file.");
    }
};

module.exports = {
    uploadImage,
    getImage,
    deleteImage,
};
