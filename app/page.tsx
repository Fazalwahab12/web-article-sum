"use client";

import { useEffect, useState } from "react";
import { Article } from "./types/article";

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch("/api/update-articles");
        const data = await response.json();
        if (data.success) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Latest Articles from Multiple Sources
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-500 mb-2">{article.source}</div>
              <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
              <div className="text-sm text-gray-600 mb-2">
                By {article.author} • {article.date}
              </div>
              <a
                href={article.link}
                className="text-blue-600 hover:underline mb-4 block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read full article
              </a>
              <p className="text-gray-800 leading-relaxed">{article.summary}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-600">Failed to load articles</p>
      )}
    </main>
  );
}
