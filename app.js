const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

//Route files
const auth = require("./routes/auth");
const camps = require("./routes/camps");
const users = require("./routes/users");
const bookings = require("./routes/bookings");
const sanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to data base
connectDB();

const app = express();

//Body parser
app.use(express.json());

//Sanitize data
app.use(sanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10mins
  max: 1,
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//Cookie parser
app.use(cookieParser());

//Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/camps", camps);
app.use("/api/v1/bookings", bookings);
app.use("/api/v1/users", users);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);

//Handle unhandle promise rejections
process.on("inhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
