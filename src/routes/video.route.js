import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { getAllVideos, publishAVideo, getVideoById, updateVideoDetails,
    deleteVideo, togglePublishStatus, updateVideoThumbnail } from "../controllers/video.controller";


const router = Router()

router.route("/").get(verifyJWT, getAllVideos)
router.route("/video-details/:videoId").get(verifyJWT, getVideoById)
router.route("/video-details/:videoId").patch(verifyJWT, updateVideoDetails)
router.route("/video-details/:videoId").delete(verifyJWT, deleteVideo)
router.route("/publish-status/:videoId").patch(verifyJWT, togglePublishStatus)
router.route("/update-thumbnail/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideoThumbnail)
router.route("/publish").post(verifyJWT,
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    publishAVideo)

export default router;