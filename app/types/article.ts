export interface Article {
  title: string;
  link: string;
  date: string;
  author: string;
  summary: string;
  source: string;
  discussionPoints: string;
}

export interface WebsiteConfig {
  url: string;
  name: string;
  baseUrl: string;
}
