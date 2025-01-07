const mongoose = require("mongoose");
const Grid = require("gridfs-stream")
const config = require("./config");
const uri = config.mongoose.url;

const clientOptions = {
    serverApi: {version: "1", strict: true, deprecationErrors: true},
};

let gfs;
let bucket;
const run = async () => {
    try {
        // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
        await mongoose.connect(uri, clientOptions);

        gfs = Grid(mongoose.connection.db, mongoose.mongo);
        gfs.collection('uploads');
        await mongoose.connection.db.admin().command({ping: 1});
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );


    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }

}
const initBucket = async () => {
    mongoose.connection.on("connected", () => {
        bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "uploads",
        });
        console.log('bucket connected')
    });
}
const getGFS = () => {
    if (!gfs) throw new Error("GFS is not initialized");
    return gfs;
};

const  getbucket = () => {
    if (!bucket) throw new Error("Bucket is not initialized");
    return bucket;
}

module.exports = {run, getGFS,initBucket, getbucket};
