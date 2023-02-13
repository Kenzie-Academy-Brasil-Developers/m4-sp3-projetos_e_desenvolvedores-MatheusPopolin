import { QueryResult } from "pg";

export interface iDeveloper {
  id: number;
  name: string;
  email: string;
}

export type DeveloperResult = QueryResult<iDeveloper>;

export type DeveloperRequiredKeys = "name" | "email";

export interface iDeveloperUpdate {
  name?: string;
  email?: string;
}

export interface iDeveloperInfos{
  id: number;
  developerSince: string;
  preferredOS: string;
  developerInfoId: number;
}

export type DeveloperInfosResult = QueryResult<iDeveloperInfos>

export type DeveloperInfosRequiredKeys = "developerSince" | "preferredOS";

export interface iDeveloperInfosUpdate {
  developerSince?: string;
  preferredOS?: string;
}