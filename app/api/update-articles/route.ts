// app/api/update-articles/route.ts
import { fetchLatestArticles } from "@/app/lib/webscraping";
import { storeArticles } from "@/app/lib/articleService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Starting article update process...");

    // First fetch new articles from websites
    const scrapedArticles = await fetchLatestArticles();
    console.log(`Fetched ${scrapedArticles.length} articles from sources`);

    // Log articles with missing required fields
    scrapedArticles.forEach((article) => {
      const missingFields = [];
      if (!article.title) missingFields.push("title");
      if (!article.link) missingFields.push("link");
      if (!article.date) missingFields.push("date");
      if (!article.summary) missingFields.push("summary");

      if (missingFields.length > 0) {
        console.log(
          `Article from ${article.source} is missing fields:`,
          missingFields
        );
      }
    });

    // Then store them in MongoDB
    const savedArticles = await storeArticles(scrapedArticles);

    return NextResponse.json({
      success: true,
      articles: savedArticles,
      count: savedArticles.length,
      totalFetched: scrapedArticles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in update-articles API:", error);

    // Detailed error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update articles",
        details: error.message,
        timestamp: new Date().toISOString(),
        errorType: error.name,
        // Don't include stack trace in production
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
