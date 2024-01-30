import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from '../controllers/like.controller.js';

const router = Router();

router.use(verifyJWT);

router.route("/toggle-comment-like/:commentId").post(toggleCommentLike);
router.route("/toggle-tweet-like/:tweetId").post(toggleTweetLike);
router.route("/toggle-video-like/:videoId").post(toggleVideoLike);
router.route("/get-liked-videos").get(getLikedVideos);

export default router;

