import { NextResponse } from "next/server";
import { fetchLatestArticles } from "@/app/lib/webscraping";

export async function GET() {
  try {
    const articles = await fetchLatestArticles();
    console.log("articles", articles);

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    console.error("Error updating articles:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    return NextResponse.json(
      { success: false, error: "Failed to update articles" },
      { status: 500 }
    );
  }
}
