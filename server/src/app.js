// Server creation and configs
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. server-to-server, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(
      new Error(`CORS: origin "${origin}" is not in the allowed list`),
      false,
    );
  },
  credentials: true,
}));

// to let server read req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/",(req,res)=>{
  res.send("Welcome to Hexa Ledger API");
})

/**
 * - Routes required
*/
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transactoin.route");



/**
 * - Use Routes
 */
app.use('/api/auth',authRouter);
app.use('/api/account',accountRouter);
app.use('/api/transactions',transactionRouter);


module.exports = app;