import { QueryResult } from "pg";

export interface iProject {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: string;
  endDate: number | null;
  developerId: number;
}

export interface iProjectUpdate {
  name?: string;
  description?: string;
  estimatedTime?: string;
  repository?: string;
  startDate?: string;
  endDate?: number | null;
  developerId?: number;
}

export type ProjectResult = QueryResult<iProject>;

export type ProjectRequiredKeys =
  | "name"
  | "description"
  | "estimatedTime"
  | "repository"
  | "startDate"
  | "developerId";

export type Technologies =
  | "JavaScript"
  | "Python"
  | "React"
  | "Express.js"
  | "HTML"
  | "CSS"
  | "Django"
  | "PostgreSQL"
  | "MongoDB";
