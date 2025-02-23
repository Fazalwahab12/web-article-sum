import axios from "axios";
import { Article, WebsiteConfig } from "../types/article";
import { WEBSITE_CONFIGS } from "./constants";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeRequestWithRetry(
  url: string,
  siteName: string,
  maxRetries = 3
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 60000,
        headers: {
          "Accept-Encoding": "gzip,deflate,compress",
        },
      });
      return response.data.result;
    } catch (error: any) {
      console.error(
        `Attempt ${attempt} failed for ${siteName}:`,
        error.message
      );

      if (attempt === maxRetries) {
        throw error;
      }

      const backoffDelay = Math.min(
        1000 * Math.pow(2, attempt) + Math.random() * 1000,
        10000
      );
      console.log(
        `Retrying ${siteName} in ${Math.round(backoffDelay / 1000)} seconds...`
      );
      await delay(backoffDelay);
    }
  }
}

function formatDiscussionPoints(data: any): string {
  if (!data.latest_discussion_points) return "";

  if (Array.isArray(data.latest_discussion_points.values)) {
    return data.latest_discussion_points.values
      .map((value: any) => value.string_value)
      .join("\n");
  }

  if (Array.isArray(data.latest_discussion_points)) {
    return data.latest_discussion_points.join("\n");
  }

  if (typeof data.latest_discussion_points === "string") {
    return data.latest_discussion_points;
  }

  return "";
}

async function fetchArticleForSite(
  site: WebsiteConfig,
  dateFilter: string
): Promise<any> {
  const url = `https://api.webscraping.ai/ai/fields?api_key=${
    process.env.WEBSCRAPING_API_KEY
  }&url=${encodeURIComponent(
    site.url
  )}&fields[latest_title]=Get ${dateFilter} article title&fields[latest_link]=URL of the article&fields[latest_date]=Publication date of the article&fields[latest_author]=Author name of the article&fields[latest_summary]=Generate a detailed summary under 300 words of the article's main points excluding author information&fields[latest_discussion_points]=Summarize the steps and tips and discuss the key points of this article`;

  return makeRequestWithRetry(url, site.name);
}

export async function fetchLatestArticles(): Promise<Article[]> {
  const articles: Article[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const site of WEBSITE_CONFIGS) {
    try {
      // First try to get today's article
      console.log(`Checking for today's article from ${site.name}...`);
      let data = await fetchArticleForSite(
        site,
        "only articles published today, return the most recent"
      );

      // If no article found today, get random article from past 30 days
      if (!data.latest_title || !data.latest_date) {
        console.log(
          `No article found today for ${site.name}, fetching random article from past 30 days...`
        );
        data = await fetchArticleForSite(
          site,
          "a random article from the past 30 days"
        );

        // Skip if no article found or if article is too old
        if (!data.latest_date || new Date(data.latest_date) < thirtyDaysAgo) {
          console.log(
            `No valid article found for ${site.name} within the last 30 days`
          );
          continue;
        }
      }

      articles.push({
        title: data.latest_title || "",
        link: data.latest_link?.startsWith("http")
          ? data.latest_link
          : `${site.baseUrl}${data.latest_link || ""}`,
        date: data.latest_date || "",
        author: data.latest_author || "Unknown",
        summary: data.latest_summary || "",
        source: site.name,
        discussionPoints: formatDiscussionPoints(data),
      });

      console.log(`Successfully fetched data from: ${site.name}`);
      await delay(2000); // Respect rate limits
    } catch (error: any) {
      console.error(
        `Failed to fetch from ${site.name} after all retries:`,
        error.message
      );
    }
  }

  return articles;
}
