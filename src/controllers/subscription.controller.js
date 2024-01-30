import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRespone.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    const subscriberId = req.user._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }

    const channelExists = await User.exists({ _id: channelId })

    if (!channelExists) {
        throw new ApiError(404, "Channel not found")
    }

    const subscription = await Subscription.findOne({
        subscriber: subscriberId, channel: channelId
    })

    if (!subscription) {
        // create subscription
        const createSubscription = await Subscription.create({
            subscriber: subscriberId, channel: channelId
        })

        if (!createSubscription) {
            throw new ApiError(500, "Subscription creation failed")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, createSubscription, "Subscription created successfully"))
    } else {

        const deletedSubscription = await Subscription.deleteOne({
            subscriber: subscriberId, channel: channelId
        })

        if (!deletedSubscription) {
            throw new ApiError(500, "Subscription deletion failed")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Subscription deleted successfully"))

    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const channelExists = await User.exists({ _id: channelId })

    if (!channelExists) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriberInfo: {
                    $first: "$subscriberDetails"
                }
            }
        }
    ])

    if (!subscribers) {
        res
            .status(200)
            .json(new ApiResponse(200, {}, "No subscribers found"))
    }

    res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers found"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid SubscriberId")
    }

    const user = await User.findById(subscriberId)

    if (!user) {
        throw new ApiError(400, "User not found while getting its subscriptions")
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelInfo",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channelInfo: {
                    $first: "$channelInfo"
                }
            }
        }
    ])
    if (channels.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "user has not subscribed to any channel"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channels,
                "channels subscribed by user fetched successfully"
            )
        )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}