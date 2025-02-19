import axios from "axios";

const WEBSITE_CONFIGS = [
  {
    url: "https://www.projectmanagement.com/",
    name: "Project Management",
    baseUrl: "https://www.projectmanagement.com",
  },
  {
    url: "https://www.enterpriseengagement.org/newswire/news/",
    name: "Enterprise Engagement",
    baseUrl: "https://www.enterpriseengagement.org",
  },
  {
    url: "https://www.thebrandingjournal.com/",
    name: "Branding Journal",
    baseUrl: "https://www.thebrandingjournal.com",
  },
  {
    url: "https://www.pmi.org/blog",
    name: "PMI Blog",
    baseUrl: "https://www.pmi.org",
  },
  {
    url: "https://hbr.org/",
    name: "Harvard Business Review",
    baseUrl: "https://hbr.org",
  },
  {
    url: "https://brandingstrategyinsider.com/",
    name: "Branding Strategy Insider",
    baseUrl: "https://brandingstrategyinsider.com",
  },
  {
    url: "https://seths.blog/",
    name: "Seth's Blog",
    baseUrl: "https://seths.blog",
  },
  {
    url: "https://www.brandingmag.com/",
    name: "Branding Magazine",
    baseUrl: "https://www.brandingmag.com",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeRequestWithRetry(
  url: string,
  siteName: string,
  maxRetries = 3
) {
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

export async function fetchLatestArticles() {
  const articles = [];

  for (const site of WEBSITE_CONFIGS) {
    try {
      const url = `https://api.webscraping.ai/ai/fields?api_key=${
        process.env.WEBSCRAPING_API_KEY
      }&url=${encodeURIComponent(
        site.url
      )}&fields[latest_title]=Get only the most recent article post title&fields[latest_link]=URL of the most recent article&fields[latest_date]=Publication date of the most recent article&fields[latest_author]=Author name of the article&fields[latest_summary]=Generate a detailed summary under 300 words of the most recent article's main points excluding author information&fields[latest_discussion_points]=Summarize the steps and tips and discuss the key points of this article`;

      console.log(`Starting fetch for ${site.name}...`);
      const data = await makeRequestWithRetry(url, site.name);

      let formattedDiscussionPoints = "";
      if (data.latest_discussion_points) {
        if (Array.isArray(data.latest_discussion_points.values)) {
          formattedDiscussionPoints = data.latest_discussion_points.values
            .map((value: any) => value.string_value)
            .join("\n");
        } else if (Array.isArray(data.latest_discussion_points)) {
          formattedDiscussionPoints = data.latest_discussion_points.join("\n");
        } else if (typeof data.latest_discussion_points === "string") {
          formattedDiscussionPoints = data.latest_discussion_points;
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
        discussionPoints: formattedDiscussionPoints,
      });

      console.log(`Successfully fetched data from: ${site.name}`);
      await delay(2000);
    } catch (error: any) {
      console.error(
        `Failed to fetch from ${site.name} after all retries:`,
        error.message
      );
    }
  }

  return articles;
}
