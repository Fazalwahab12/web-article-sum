"use client";
import { Key, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react";

export default function ArticlesPage() {
  const [articlesByDate, setArticlesByDate] = useState<Record<string, any[]>>({});
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState<
    Record<string | number, boolean>
  >({});

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get("/api/articles");
      
      // Group articles by createdAt date
      const articles = response.data.articles;
      const grouped: Record<string, any[]> = {};
      
      articles.forEach((article: any) => {
        // Extract YYYY-MM-DD from createdAt
        const dateStr = new Date(article.createdAt).toISOString().split('T')[0];
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(article);
      });
      
      // Sort dates in descending order (newest first)
      const sortedDates = Object.keys(grouped).sort().reverse();
      
      setArticlesByDate(grouped);
      setDates(sortedDates);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateArticles = async () => {
    try {
      setUpdating(true);
      // First call the update-articles API to scrape and store new articles
      await axios.get("/api/update-articles");
      // Then fetch the latest articles including the newly added ones
      await fetchArticles();
    } catch (error) {
      console.error("Failed to update articles:", error);
    } finally {
      setUpdating(false);
    }
  };

  const toggleExpanded = (id: string | number) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateString: string | number | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatArticleDate = (dateString: string) => {
    // Format the article's published date (which might be in various formats)
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString; // If we can't parse it, return as is
    }
  };

  // Determine if date is today
  const isToday = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  // Determine if date is yesterday
  const isYesterday = (dateString: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === yesterday.getTime();
  };

  // Get appropriate date heading
  const getDateHeading = (dateString: string) => {
    if (isToday(dateString)) {
      return "Today's Articles";
    } else if (isYesterday(dateString)) {
      return "Yesterday's Articles";
    } else {
      return `Articles from ${formatDate(dateString)}`;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Latest Industry Insights
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Stay updated with the latest articles from leading industry sources
          </p>
          <div className="flex justify-center">
            <button
              onClick={updateArticles}
              disabled={updating}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Get Today's Articles</span>
                </>
              )}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dates.length > 0 ? (
          <div className="space-y-12">
            {dates.map((dateStr) => (
              <div key={dateStr} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
                  {getDateHeading(dateStr)}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {articlesByDate[dateStr].map((article) => (
                    <Card
                      key={article._id}
                      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            {article.source}
                          </span>
                          <span className="text-sm text-gray-500">
                            Published: {formatArticleDate(article.date)}
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold leading-tight">
                          {article.title}
                        </CardTitle>
                        <div className="text-sm text-gray-600">
                          By {article.author}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                          {article.summary}
                        </p>

                        {article.discussionPoints && (
                          <div className="space-y-2">
                            <button
                              onClick={() => toggleExpanded(article._id)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <span className="font-medium">Discussion Points</span>
                              {expandedArticles[article._id] ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>

                            {expandedArticles[article._id] && (
                              <div className="pl-4 border-l-2 border-blue-200 mt-2 space-y-2">
                                {article.discussionPoints
                                  .split("\n")
                                  .filter((point: string) => point.trim() !== "")
                                  .map(
                                    (
                                      point: string,
                                      index: Key | null | undefined
                                    ) => (
                                      <p key={index} className="text-gray-700">
                                        • {point.trim()}
                                      </p>
                                    )
                                  )}
                              </div>
                            )}
                          </div>
                        )}

                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <span>Read full article</span>
                          <ExternalLink size={16} />
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">
              Unable to load articles. Please try again later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
