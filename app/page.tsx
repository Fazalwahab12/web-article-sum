"use client";
import { Key, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticles, setExpandedArticles] = useState<
    Record<string | number, boolean>
  >({});

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get("/api/articles");
      setArticles(response.data.articles);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
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
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Latest Industry Insights
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest articles from leading industry sources
          </p>
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
        ) : articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
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
                      {formatDate(article.date)}
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
