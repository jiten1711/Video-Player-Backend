import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

// middleware configuration for json, urlencoded and static(images, etc. to be stored in Public folder) files
app.use(express.json({limit: "16kb", extended: true}))
app.use(express.urlencoded({limit: "16kb", extended: true}))
app.use(express.static("public"))
// there are some files that server stores in cookies of client browser, so we need to parse them
app.use(cookieParser())

export { app }