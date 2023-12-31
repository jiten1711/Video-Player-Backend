import express from 'express';
import connectDb from './db/db.js';
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
})


connectDb();


// Another way to connect to DB direct in index file
// ;( async ()=> {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.error("Error from Express : ", error);
//             throw error;
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening in port: ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error("Error : ",error )
//         throw error
//     }
// })()