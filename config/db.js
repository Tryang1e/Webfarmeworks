const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.DB_CONNECT);
        console.log(`DB Connected: ${connect.connection.host}`);
    } catch (err) {
        console.log(err);
    }
};

module.exports = connectDb;
