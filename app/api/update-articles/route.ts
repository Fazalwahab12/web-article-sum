import { getGoogleSheets } from "@/app/lib/google-sheets";
import { fetchLatestArticles } from "@/app/lib/webscraping";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const articles = await fetchLatestArticles();
    console.log("articles", articles);

    const doc = await getGoogleSheets();
    const sheet = doc.sheetsByIndex[0];

    await sheet.loadHeaderRow();

    if (!sheet.headerValues || sheet.headerValues.length === 0) {
      await sheet.setHeaderRow([
        "timestamp",
        "author",
        "title",
        "link",
        "date",
        "source",
        "discussion_points",
        "summary",
      ]);
    }

    for (const article of articles) {
      // Add some logging to debug the data
      console.log(
        "Adding row with discussion points:",
        article.discussionPoints
      );

      await sheet.addRow({
        timestamp: new Date().toISOString(),
        title: article.title,
        link: article.link,
        date: article.date,
        author: article.author,
        summary: article.summary,
        source: article.source,
        discussion_points: article.discussionPoints, // Now this should be a string
      });
    }

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("Error updating articles:", error);
    // Add more detailed error logging
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    return NextResponse.json(
      { success: false, error: "Failed to update articles" },
      { status: 500 }
    );
  }
}
