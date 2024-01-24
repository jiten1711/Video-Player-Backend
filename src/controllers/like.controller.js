import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespone.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    const likedBy = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const videoExists = await Video.findById(videoId)

    if (!videoExists) {
        throw new ApiError(404, "Video not found")
    }

    const like = await Like.findOne([
        {
            $and: [
                { video: videoId },
                { likedBy: likedBy }
            ]
        }
    ])

    if (!like) {
        const newLike = await Like.create({
            video: videoId,
            likedBy: likedBy,
        })
        if (!newLike) {
            throw new ApiError(500, "Like creation failed")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Like created successfully"))
    }
    else {
        const deletedLike = await Like.deleteOne({
            $and: [
                { video: videoId },
                { likedBy: likedBy }
            ]
        })

        if (!deletedLike) {
            throw new ApiError(500, "Like deletion failed")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like deleted successfully"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const likedBy = req.user?._id

    const like = await Like.findOne([
        {
            $and: [
                { comment: commentId },
                { likedBy: likedBy }
            ]
        }
    ])

    if (!like) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: likedBy,
        })
        if (!newLike) {
            throw new ApiError(500, "Like creation failed")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Like created successfully"))
    }
    else {
        const deletedLike = await Like.deleteOne({
            $and: [
                { comment: commentId },
                { likedBy: likedBy }
            ]
        })

        if (!deletedLike) {
            throw new ApiError(500, "Like deletion failed")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like deleted successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const likedBy = req.user?._id

    const like = await Like.findOne([
        {
            $and: [
                { tweet: tweetId },
                { likedBy: likedBy }
            ]
        }
    ])

    if (!like) {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: likedBy,
        })
        if (!newLike) {
            throw new ApiError(500, "Like creation failed")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Like created successfully"))
    }
    else {
        const deletedLike = await Like.deleteOne({
            $and: [
                { tweet: tweetId },
                { likedBy: likedBy }
            ]
        })

        if (!deletedLike) {
            throw new ApiError(500, "Like deletion failed")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Like deleted successfully"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id

    const likedVideos = Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $exists: true,
                },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
        {
            $addFields: {
                videoDetails: {
                    $first: "$videoDetails",
                },
            },
        },
    ])

    if (likedVideos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "user has not liked any video"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "liked videos fetched successfully")
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}