import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  DeveloperRequiredKeys,
  DeveloperResult,
  iDeveloperUpdate,
  DeveloperInfosRequiredKeys,
  iDeveloperInfosUpdate,
  DeveloperInfosResult,
} from "../interfaces/developers.interafces";

export const registerDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const { name, email } = request.body;
  const missingKeys: DeveloperRequiredKeys[] = [];

  if (!name) {
    missingKeys.push("name");
  }
  if (!email) {
    missingKeys.push("email");
  }

  if (missingKeys.length > 0) {
    return response.status(400).json({
      message: `Missing required keys: ${missingKeys}.`,
    });
  }

  const queryString: string = `
    INSERT INTO "developers"
      ("name", "email")
    VALUES
      ($1, $2)
    RETURNING *;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [name, email],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

export const readAllDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
  SELECT d.id "developerId",
    d.name "developerName",
    d.email "developerEmail",
    di.id "developerInfoId",
    di."developerSince" "developerInfoDeveloperSince",
    di."preferredOS" "developerInfoPreferredOS"
  FROM 
    developers d
  LEFT JOIN 
    developer_infos di 
  ON 
    d.id = di."developerId";
  `;

  const queryResult: DeveloperResult = await client.query(queryString);

  return response.status(200).json(queryResult.rows);
};

export const readDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
  SELECT d.id "developerId",
    d.name "developerName",
    d.email "developerEmail",
    di.id "developerInfoId",
    di."developerSince" "developerInfoDeveloperSince",
    di."preferredOS" "developerInfoPreferredOS"
  FROM 
    developers d
  LEFT JOIN 
    developer_infos di 
  ON 
    d.id = di."developerId"
  WHERE 
    d.id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [request.params.id],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export const addDeveloperInfos = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const { developerSince, preferredOS } = request.body;

  const missingKeys: DeveloperInfosRequiredKeys[] = [];

  if (!developerSince) {
    missingKeys.push("developerSince");
  }
  if (!preferredOS) {
    missingKeys.push("preferredOS");
  }

  if (missingKeys.length > 0) {
    return response.status(400).json({
      message: `Missing required keys: ${missingKeys}.`,
    });
  }

  const { id: developerId } = request.params;

  let queryString: string = `
    INSERT INTO "developer_infos"
      ("developerSince", "preferredOS", "developerId")
    VALUES
      ($1, $2, $3)
    RETURNING *;
    `;

  let queryConfig: QueryConfig = {
    text: queryString,
    values: [developerSince, preferredOS, developerId],
  };

  const queryResult: DeveloperInfosResult = await client.query(queryConfig);

  const infoId = queryResult.rows[0].id;

  queryString = `
    UPDATE "developers"
    SET ("developerInfoId") = ROW ($1)
    WHERE id = $2
    RETURNING *;
    `;

  queryConfig = {
    text: queryString,
    values: [infoId ,developerId],
  };

  await client.query(queryConfig)


  return response.status(201).json(queryResult.rows[0]);
};

export const updateDeveloper = async (request: Request, response: Response) => {
  const id = Number(request.params.id);
  const updatableKeys: DeveloperRequiredKeys[] = ["email", "name"];
  const requestDataKeys = Object.keys(request.body);

  if (!updatableKeys.some((key) => requestDataKeys.includes(key))) {
    return response.status(400).json({
      message: "At least one of those keys must be send.",
      keys: updatableKeys,
    });
  }

  const { name, email } = request.body;

  let newData: iDeveloperUpdate = {};

  if (name) {
    newData.name = name;
  }

  if (email) {
    newData.email = email;
  }

  const queryString: string = format(
    `
          UPDATE developers
          SET (%I) = ROW (%L)
          WHERE id = $1
          RETURNING *;
      `,
    Object.keys(newData),
    Object.values(newData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: DeveloperResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export const updateDeveloperInfos = async (
  request: Request,
  response: Response
) => {
  const developerId = Number(request.params.id);
  const updatableKeys: DeveloperInfosRequiredKeys[] = [
    "developerSince",
    "preferredOS",
  ];
  const requestDataKeys = Object.keys(request.body);

  if (!updatableKeys.some((key) => requestDataKeys.includes(key))) {
    return response.status(400).json({
      message: "At least one of those keys must be send.",
      keys: updatableKeys,
    });
  }

  const { developerSince, preferredOS } = request.body;

  let newData: iDeveloperInfosUpdate = {};

  if (developerSince) {
    newData.developerSince = developerSince;
  }

  if (preferredOS) {
    newData.preferredOS = preferredOS;
  }

  const queryString: string = format(
    `
          UPDATE "developer_infos"
          SET (%I) = ROW (%L)
          WHERE "developerId" = $1
          RETURNING *;
      `,
    Object.keys(newData),
    Object.values(newData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult: DeveloperInfosResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export const deleteDeveloper = async (request: Request, response: Response) => {
  const id = Number(request.params.id);

  const queryString: string = `
          DELETE FROM developers
          WHERE id = $1;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};
