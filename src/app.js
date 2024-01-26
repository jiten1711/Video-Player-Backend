import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

// middleware configuration for json, urlencoded and static(images, etc. to be stored in Public folder) files
app.use(express.json({ limit: "16kb", extended: true }))
app.use(express.urlencoded({ limit: "16kb", extended: true }))
app.use(express.static("public"))
// there are some files that server stores in cookies of client browser, so we need to parse them
app.use(cookieParser())





// routes import
import userRouter from './routes/user.route.js'
//routes declaration
app.use("/api/v1/users", userRouter)
// the above depicts http://localhost:8000/api/v1/users/<register or login>


import videoRouter from './routes/video.route.js'
app.use("/api/v1/videos", videoRouter)

import playlistRouter from './routes/playlist.route.js'
app.use("/api/v1/playlists", playlistRouter)

import subscriptionRouter from './routes/subscription.route.js'
app.use("/api/v1/subscriptions", subscriptionRouter)

import likeRouter from './routes/like.route.js'
app.use("/api/v1/likes", likeRouter)

import commentRouter from './routes/comment.route.js'
app.use("/api/v1/comment", commentRouter)

import tweetRouter from './routes/tweet.route.js'
app.use("/api/v1/tweet", tweetRouter)

export { app }