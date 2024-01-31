import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiRespone.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"

// Sort By can be Relevance, Upload Date, View Count

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // steps to get all videos a user
    // check if query is present
    // if yes, then search for videos with that query
    // if no, then get all videos
    // check if sortBy is present
    // if yes, then sort the videos based on that
    // if no, then sort by relevance
    // check if userId is present
    // if yes, then get all videos of that user
    // if no, then get all videos
    // check if pagination is present
    // if yes, then paginate the videos
    // if no, then get all videos

    //console.log(req.query)
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    if (!query || !sortBy || !sortType) {
        throw new ApiError(400, "Missing query parameters")
    }

    const user = await User.findById(userId)
    //console.log(user)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    }

    let sortOptions = {}

    if (sortBy) {
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1
    }

    const videos = Video.aggregate([
        {
            $match: {
                $and: [
                    {
                        owner: new mongoose.Types.ObjectId(userId)
                    },
                    {
                        title: {
                            $regex: new RegExp(query, "i")
                        }
                    }
                ],
            },
        },
        {
            $sort: sortOptions
        }
    ])

    const paginatedVideos = await Video.aggregatePaginate(videos, options)

    if (!paginatedVideos.totalDocs) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "No videos found of this user"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, paginatedVideos, "Videos fetched"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    // steps to publish a video
    // check if title and description is present
    // if yes, then proceed
    // if no, then throw error
    // check if video is present and can be accessed using req.file
    // if yes, then proceed
    // if no, then throw error
    // upload video to cloudinary

    if (!title || !description) {
        throw new ApiError(400, "Missing title or description")
    }
    //console.log(req.file)
    const videoPath = await req.files?.video?.[0]?.path

    const thumbnailPath = await req.files?.thumbnail?.[0]?.path
    //console.log(thumbnailPath, videoPath)

    if (!videoPath) {
        throw new ApiError(400, "Missing video")
    }

    const videoUrl = await uploadOnCloudinary(videoPath)
    const thumbnailUrl = await uploadOnCloudinary(thumbnailPath)

    if (!videoUrl.url) {
        throw new ApiError(500, "Error uploading video")
    }

    if (!thumbnailUrl.url) {
        throw new ApiError(500, "Error uploading thumbnail")
    }

    const video = await Video.create({
        videoFile: {
            publicId: videoUrl.public_id,
            url: videoUrl.url
        },
        thumbnail: {
            publicId: thumbnailUrl.public_id,
            url: thumbnailUrl.url
        },
        owner: req.user._id,
        title,
        description,
        duration: videoUrl.duration,
        views: 0,
        isPublished: true
    })

    if (!video) {
        throw new ApiError(500, "Error creating video")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log(videoId);
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.views += 1
    await video.save({ validateBeforeSave: false })

    let videoDetails = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },
                subscriberCount: {
                    $size: "$subscribers"
                },
                CommentCount: {
                    $size: "$comments"
                },
                isSubscribed: {
                    $in: [req.user._id, "$subscribers.subscriber"]
                }
            }
        }
    ])
    if (!videoDetails) {
        throw new ApiError(500, "Error fetching video details")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoDetails, "Video details fetched"))

})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    // steps to update video
    // check if videoId is present
    // check title and description from body
    // update title and description for that video
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }


    console.log(title, description)

    if (!title && !description) {
        throw new ApiError(400, "At-least title or description is required to update")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (title) {
        video.title = title
    }

    if (description) {
        video.description = description
    }

    await video.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated"))

})

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id while updating thumbnail")
    }

    const thumbnailPath = req.file?.path

    if (!thumbnailPath) {
        throw new ApiError(400, "Missing thumbnail path while updating thumbnail")
    }

    const thumbnailUrl = await uploadOnCloudinary(thumbnailPath)

    if (!thumbnailUrl.url || !thumbnailUrl.public_id) {
        throw new ApiError(500, "Error uploading thumbnail in cloudinary while updating thumbnail")
    }

    //console.log(thumbnailUrl)

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found while updating thumbnail")
    }

    const oldThumbnailPublicId = video.thumbnail?.publicId

    if (!oldThumbnailPublicId) {
        throw new ApiError(500, "Error updating thumbnail")
    }

    const updatedVideo = await Video.updateOne(
        { _id: videoId },
        {
            $set: {
                thumbnail: {
                    publicId: thumbnailUrl.public_id,
                    url: thumbnailUrl.url,
                },
            },
        }
    );

    if (!updatedVideo) {
        throw new ApiError(400, "Error while updating file");
    }

    const removeThumbnailFromCloudinary = await deleteFromCloudinary(oldThumbnailPublicId)

    if (!removeThumbnailFromCloudinary) {
        throw new ApiError(500, "Error deleting thumbnail from cloudinary")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Thumbnail updated"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // TODO: delete video
    // steps to delete video
    // check if videoId is present
    // delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    console.log(video)
    const videoPublicId = video.videoFile.publicId
    const thumbnailPublicId = video.thumbnail.publicId

    if (!videoPublicId || !thumbnailPublicId) {
        throw new ApiError(500, "Error deleting video")
    }

    const removeVideoFromCloudinary = await deleteFromCloudinary(videoPublicId, "video")
    const removeThumbnailFromCloudinary = await deleteFromCloudinary(thumbnailPublicId)

    if (!removeVideoFromCloudinary) {
        throw new ApiError(500, "Error deleting video from cloudinary")
    }

    if (!removeThumbnailFromCloudinary) {
        throw new ApiError(500, "Error deleting thumbnail from cloudinary")
    }

    const deleteMsg = await Video.deleteOne({ _id: videoId })

    if (!deleteMsg) {
        throw new ApiError(500, "Error deleting video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished

    const updateVideo = await video.save({ validateBeforeSave: false })

    if (!updateVideo) {
        throw new ApiError(500, "Error updating video publish status")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateVideo, "Video publish status updated"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus,
    updateVideoThumbnail
}