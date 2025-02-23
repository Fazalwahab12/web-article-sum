import mongoose, { Schema } from "mongoose";

const articleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    author: { type: String, default: "Unknown", trim: true },
    summary: { type: String, required: true },
    source: { type: String, required: true, trim: true },
    discussionPoints: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

articleSchema.index({ createdAt: -1 });
articleSchema.index({ source: 1, title: 1 }, { unique: true });

mongoose.models = {};

export const Article = mongoose.model("Article", articleSchema);
