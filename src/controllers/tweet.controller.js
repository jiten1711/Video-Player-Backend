import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiRespone.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user?._id;

    const { content } = req.body;

    if (!content) {
        throw new ApiError(404, "No Tweet content found")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid UserId while creating tweet")
    }

    const tweet = await Tweet.create({
        content,
        owner: userId
    })

    if (!tweet) {
        throw new ApiError(500, "Error in creating new tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(201, tweet, "Tweet is published successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user?._id
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id while fetching tweets")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(500, "Unable to fetch User while requesting user tweets")
    }

    const options = {
        page,
        limit
    }

    const tweets = Tweet.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
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
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    const results = Tweet.aggregatePaginate(tweets, options)

    if (results.totalDocs === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "User have no tweets"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet Id while updating tweet")
    }

    if (!content) {
        throw new ApiError(404, "New tweet content not found")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if (!tweet) {
        throw new ApiError(500, "Unable to update tweet")
    }

    return res
        .status(200)
        .json(200, tweet, "Tweet updated")
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet Id")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deletedTweet) {
        throw new ApiError(500, "Unable to delete tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedTweet, "Tweet is deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}




