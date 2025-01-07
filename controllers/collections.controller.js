const catchAsync = require("../utils/CatchAsync");

const httpStatus = require("http-status");
const {collectionService} = require("../services");
const pick = require("../utils/pick");


const createCollection = catchAsync(async (req, res) => {
        const collectionData = req.body
        const collection = await collectionService.createCollectionForUser(req.user.id, req.file, collectionData);
        res.status(httpStatus.CREATED).json(
            {
                message: 'New Collection Created',
                collection: collection
            }
        );
    }
)


const getCollections = catchAsync(async (req, res) => {
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        const filter = pick(req.query, ['status', 'type']);
        filter.user = req.user.id;
        const collections = await collectionService.getAllCollections(filter,options,);
        res.status(httpStatus.CREATED).json(
            {
                message: 'Successfully fetched collections',
                collections: collections
            }
        );
    }
)


module.exports = {
    createCollection,
    getCollections,
}