import connectDb from './db/db.js';
import dotenv from "dotenv";
import { app } from "./app.js"
dotenv.config({
    path: './.env'
})

connectDb()
    .then(() => {
        app.on("err", (err) => {
            console.log(`Error before App listening: ${err}`)
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is connected at port ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log(`Database Connection Failed !! :: ${err}`)
    })

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