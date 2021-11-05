require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");


const { API_PORT, DATABASE_URL } = process.env;
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to database");
})
.catch((error) => {
    console.log("Failed to connect to database:");
    console.error(error);
});
// server listening 
app.listen(API_PORT, () => {
  console.log(`API running on port ${API_PORT}`);
});