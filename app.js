var express = require("express");
var path = require("path");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/v1/index");
const {errorConverter, errorHandler} = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const httpStatus = require("http-status");
const {run, initBucket} = require("./config/database");

const app = express();

//enabling cors
app.use(cors());
app.options("*", cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("ExpenseTracking Api Server");
})
app.use("/v1", indexRouter);

// app.use("/users", usersRouter);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

const selfPing = () => {
    setInterval(() => {
        http.get(`https://expense-tracking-api-0tiy.onrender.com:${process.env.PORT || 3000}`, (res) => {
            console.log('Pinged server, status:', res.statusCode);
        }).on('error', (err) => {
            console.error('Error pinging server:', err);
        });
    }, 5 * 60 * 1000); // Ping every 5 minutes
};

run().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(console.dir);
initBucket().then()
module.exports = {
    app,
};
