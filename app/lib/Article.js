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
    dateGroup: { 
      type: String, 
      default: function() {
        const date = this.createdAt || new Date();
        return date.toISOString().split('T')[0]; 
      }
    },
  },
  { timestamps: true }
);

articleSchema.index({ createdAt: -1 });
articleSchema.index({ dateGroup: 1, createdAt: -1 });
articleSchema.index({ source: 1, title: 1 }, { unique: true });

articleSchema.pre('save', function(next) {
  if (this.createdAt) {
    this.dateGroup = this.createdAt.toISOString().split('T')[0];
  }
  next();
});

articleSchema.statics.getArticlesByDate = async function(limit = 30) {
  const articles = await this.find({})
    .sort({ createdAt: -1 })
    .limit(limit * 10)
    .lean();
  
  const groupedArticles = {};
  articles.forEach(article => {
    const dateGroup = article.dateGroup || 
      (article.createdAt ? new Date(article.createdAt).toISOString().split('T')[0] : 'Unknown');
    
    if (!groupedArticles[dateGroup]) {
      groupedArticles[dateGroup] = [];
    }
    groupedArticles[dateGroup].push(article);
  });
  
  return groupedArticles;
};

mongoose.models = {};

export const Article = mongoose.model("Article", articleSchema);
