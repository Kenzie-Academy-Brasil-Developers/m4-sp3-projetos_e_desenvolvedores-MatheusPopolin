import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

export const ensureEmailIsUnused = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const email = request.body.email;

  const queryString: string = `
      SELECT *
      FROM developers
      WHERE email = $1;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [email],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (queryResult.rowCount > 0) {
    return response.status(409).json({ message: "Email already exists." });
  }

  return next();
};

export const ensureDeveloperExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  let id = Number(request.body.developerId);

  if (request.route.path.includes("developers")) {
    id = Number(request.params.id);
  }

  const queryString: string = `
          SELECT *
          FROM developers
          WHERE id = $1;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(404).json({ message: "Developer not found." });
  }

  return next();
};
