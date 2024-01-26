import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"


const router = Router()
router.use(verifyJWT)


router.route("/create-tweet").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/c/:tweetId").patch(updateTweet).delete(deleteTweet)

export default router;



