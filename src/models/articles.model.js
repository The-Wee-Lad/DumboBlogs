import mongoose, { Schema } from "mongoose";


const articleSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        markdown: {
            type: String,
            trim: true,
            required:true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        isPublic: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);


export const Articles = mongoose.model("articles", articleSchema);