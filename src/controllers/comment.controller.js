import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiRespone"
import { asyncHandler } from "../utils/asyncHandler"
import { Comment } from "../models/comment.model"
import { Video } from "../models/video.model"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId while requesting comments")
    }

    const videoExists = await Video.findById(videoId)

    if (!videoExists) {
        throw new ApiError(400, "Video does not existing while requesting comments")
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userDetails",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                userDetails: {
                    $first: "userDetails"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    const options = {
        page,
        limit
    }

    const results = await Comment.aggregatePaginate(comments, options)

    if (results.totalDocs === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "There are no comments in the video"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments sent successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const userId = req.user?._id
    const { content } = req.body

    if (!videoId) {
        throw new ApiError(400, "Invalid video Id")
    }

    if (!content) {
        throw new ApiError(400, "Content is not available")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    if (!comment) {
        throw new ApiError(500, "Error creating new comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "new comment add successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { newContent } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment Id")
    }

    if (!newContent) {
        throw new ApiError(404, "New content is not available")
    }

    const newComment = await Comment.findByIdAndUpdate(commentId, {
            $set: {
                content: newContent
            }
        },
        {
            new: true
        }
    );

    if (!newComment) {
        throw new ApiError(500, "Error in updating the comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment Id while deleting the comment")
    }

    const comment = Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(500, "Error in deleting comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}