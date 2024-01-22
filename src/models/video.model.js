import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        publicId: {
            type: String,
            required: [true, "Video public id is required"]
        },
        url: {
            type: String,
            required: [true, "Video url is required"]
        }
    },
    thumbnail: {
        publicId: {
            type: String,
            required: [true, "Thumbnail public id is required"]
        },
        url: {
            type: String,
            required: [true, "Thumbnail url is required"]
        }
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);