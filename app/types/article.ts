import { Key } from "readline";

export interface Article {
  _id: Key | null | undefined;
  id: string;
  title: string;
  link: string;
  date: string;
  author: string;
  summary: string;
  source: string;
  discussionPoints: string;
  createdAt: Date;
}
