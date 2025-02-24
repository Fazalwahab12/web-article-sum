// lib/articleService.ts
import { Article } from "./Article";
import { connectDB } from "./mongodb";
import { format } from "date-fns";

// Type definitions for better type safety
interface ScrapedArticle {
  title: string;
  link: string;
  date?: string;
  author?: string;
  summary: string;
  source: string;
  discussionPoints?: string;
}

// Validation and data transformation functions
function validateAndTransformArticle(article: ScrapedArticle) {
  // Get current date in YYYY-MM-DD format for fallback
  const today = format(new Date(), "yyyy-MM-dd");

  return {
    title: article.title?.trim() || "Untitled",
    link: article.link?.trim() || "",
    date: article.date?.trim() || today,
    author: article.author?.trim() || "Unknown",
    summary: article.summary?.trim() || "No summary available",
    source: article.source?.trim() || "Unknown Source",
    discussionPoints: article.discussionPoints?.trim() || "",
    createdAt: new Date(),
  };
}

export async function storeArticles(articles: ScrapedArticle[]) {
  try {
    await connectDB();

    const validArticles = articles.filter(
      (article) =>
        article.title && article.link && article.summary && article.source
    );

    console.log(
      `Attempting to store ${validArticles.length} valid articles out of ${articles.length} total`
    );

    const results = await Article.insertMany(
      validArticles.map(validateAndTransformArticle),
      { ordered: false } // Continues even if some documents fail
    );

    console.log(`Successfully stored ${results.length} articles`);
    return results;
  } catch (error: any) {
    if (error.code === 11000) {
      console.warn("Duplicate entry detected. Continuing...");
    } else {
      console.error("Error storing articles:", error);
      throw error;
    }
  }
}

export async function getArticles() {
  try {
    await connectDB();

    const articles = await Article.find({})
      .sort({ createdAt: -1 }) // Latest articles first
      .lean();

    console.log(`Retrieved ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error("Error retrieving articles:", error);
    throw error;
  }
}
