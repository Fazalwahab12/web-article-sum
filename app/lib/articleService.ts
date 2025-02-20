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

    // Filter out articles with missing required fields
    const validArticles = articles.filter(
      (article) =>
        article.title && article.link && article.summary && article.source
    );

    console.log(
      `Attempting to store ${validArticles.length} valid articles out of ${articles.length} total`
    );

    const results = await Promise.all(
      validArticles.map(async (article) => {
        try {
          // Transform and validate the article data
          const transformedArticle = validateAndTransformArticle(article);

          // Log the article being processed
          console.log(
            `Processing article: "${transformedArticle.title}" from ${transformedArticle.source}`
          );

          const result = await Article.findOneAndUpdate(
            {
              source: transformedArticle.source,
              title: transformedArticle.title,
            },
            transformedArticle,
            {
              upsert: true,
              new: true,
              runValidators: true,
            }
          );

          console.log(`Successfully stored article: ${result.title}`);
          return result;
        } catch (err) {
          console.error(`Error storing article from ${article.source}:`, err);
          console.error("Article data:", JSON.stringify(article, null, 2));
          return null;
        }
      })
    );

    const savedArticles = results.filter(Boolean);
    console.log(`Successfully stored ${savedArticles.length} articles`);

    return savedArticles;
  } catch (error) {
    console.error("Error storing articles:", error);
    throw error;
  }
}

export async function getArticles() {
  try {
    await connectDB();

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const articles = await Article.find({
      createdAt: { $gt: tenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Retrieved ${articles.length} articles from the last 10 days`);
    return articles;
  } catch (error) {
    console.error("Error retrieving articles:", error);
    throw error;
  }
}
