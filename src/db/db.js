import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB Connected !! \n Host : ${conn.connection.host}`);
        //console.log(conn)
    } catch (error) {
        console.error("Error in MongoDBConnection : ", error);
        process.exit(1);
    }
}

export default connectDb;