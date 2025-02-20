import { getArticles } from "@/app/lib/articleService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json({
      success: true,
      articles,
      count: articles.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch articles",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
