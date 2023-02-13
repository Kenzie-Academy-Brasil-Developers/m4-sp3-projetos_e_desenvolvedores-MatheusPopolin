import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  iProjectUpdate,
  ProjectRequiredKeys,
  ProjectResult,
  Technologies,
} from "../interfaces/projects.interfaces";

export const registerProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const {
    name,
    description,
    estimatedTime,
    repository,
    startDate,
    developerId,
  } = request.body;

  const requiredKeys: ProjectRequiredKeys[] = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "developerId",
  ];

  const requestKeys = Object.keys(request.body);

  const hasAllKeys = requiredKeys.every((key) => requestKeys.includes(key));

  if (!hasAllKeys) {
    return response.status(400).json({
      message: `Required keys are: ${requiredKeys}.`,
    });
  }

  const queryString: string = `
    INSERT INTO "projects"
      ("name", 
      "description",
      "estimatedTime",
      "repository",
      "startDate",
      "developerId")
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    ],
  };

  const queryResult: ProjectResult = await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

export const registerProjectTechnology = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const options: Technologies[] = [
    "JavaScript",
    "Python",
    "React",
    "Express.js",
    "HTML",
    "CSS",
    "Django",
    "PostgreSQL",
    "MongoDB",
  ];
  const { name } = request.body;

  const isAOption = options.some((option) => name === option);

  if (!isAOption) {
    return response.status(400).json({
      message: "Technology not supported.",
      options: options,
    });
  }

  let queryString: string = `
    SELECT t.id
    FROM technologies t
    WHERE t.name = $1;
  `;

  let queryConfig: QueryConfig = {
    text: queryString,
    values: [name],
  };

  let queryResult: QueryResult = await client.query(queryConfig);

  const technologyId = Number(queryResult.rows[0].id);
  const projectId = Number(request.params.id);
  const addedIn = new Date();

  const data = { technologyId, projectId, addedIn };

  queryString = format(
    `
  INSERT INTO projects_technologies
    (%I)
  VALUES 
    (%L)
    RETURNING*
    `,
    Object.keys(data),
    Object.values(data)
  );

  queryResult = await client.query(queryString);

  const projectTechnologiesId = queryResult.rows[0].id;

  queryString = `
    SELECT t.id "technologyId", 
      t.name "technologyName", 
      p.id "projectId",
      p.name "projectName",
      p.description "projectDescription",
      p."estimatedTime" "projectEstimatedTime",
      p.repository "projectRepository",
      p."startDate" "projectStartDate",
      p."endDate" "projectEndDate"
    FROM 
      projects_technologies pt
    JOIN
      technologies t ON pt."technologyId" = t.id      
    RIGHT JOIN
      projects p ON pt."projectId" = p.id
    WHERE 
      pt.id = $1;
    `;

  queryConfig = {
    text: queryString,
    values: [projectTechnologiesId],
  };

  queryResult = await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

export const readAllProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
  SELECT p.id "projectId",
    p.name "projectName",
    p.description "projectDescription",
    p."estimatedTime" "projectEstimatedTime",
    p.repository "projectRepository",
    p."startDate" "projectStartDate",
    p."endDate" "projectEndDate",
    p."developerId" "projectDeveloperId",
    t.id "technologyId",
    t.name "technologyName"
  FROM 
    projects_technologies pt
  RIGHT JOIN
    technologies t ON pt."technologyId" = t.id      
  RIGHT JOIN
    projects p ON pt."projectId" = p.id;    
  `;

  const queryResult: ProjectResult = await client.query(queryString);

  return response.status(200).json(queryResult.rows);
};

export const readDeveloperProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerId = Number(request.params.id);

  const queryString: string = `
  SELECT d.id "developerId", 
    d.name "developerName", 
    d.email "developerEmail", 
    d."developerInfoId"  "developerInfoId", 
    di."developerSince" "developerInfoDeveloperSince", 
    di."preferredOS" "developerInfoPreferredOS", 
    p.id "projectId",
    p.name "projectName",
    p.description "projectDescription",
    p."estimatedTime" "projectEstimatedTime",
    p.repository "projectRepository",
    p."startDate" "projectStartDate",
    p."endDate" "projectEndDate",
    t.id "technologyId",
    t.name "technologyName"
  FROM 
    projects_technologies pt
  JOIN
    technologies t ON pt."technologyId" = t.id      
  RIGHT JOIN
    projects p ON pt."projectId" = p.id
  JOIN 
    developers d ON p."developerId" = d.id
  LEFT JOIN 
    developer_infos di 
  ON 
    d.id = di."developerId"
  WHERE 
    d.id = $1;   
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult: ProjectResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows);
};

export const readProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectId = Number(request.params.id);

  const queryString: string = `
    SELECT p.id "projectId",
      p.name "projectName",
      p.description "projectDescription",
      p."estimatedTime" "projectEstimatedTime",
      p.repository "projectRepository",
      p."startDate" "projectStartDate",
      p."endDate" "projectEndDate",
      p."developerId" "projectDeveloperId",
      t.id "technologyId",
      t.name "technologyName"
    FROM 
      projects_technologies pt
    JOIN
      technologies t ON pt."technologyId" = t.id      
    RIGHT JOIN
      projects p ON pt."projectId" = p.id
    WHERE
      p.id = $1;            
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult: ProjectResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows);
};

export const updateProject = async (request: Request, response: Response) => {
  const projectId = Number(request.params.id);
  const updatableKeys = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "endDate",
    "developerId",
  ];
  const requestDataKeys = Object.keys(request.body);

  if (!updatableKeys.some((key) => requestDataKeys.includes(key))) {
    return response.status(400).json({
      message: "At least one of those keys must be send.",
      keys: updatableKeys,
    });
  }

  const {
    name,
    description,
    estimatedTime,
    repository,
    startDate,
    endDate,
    developerId,
  } = request.body;

  let newData: iProjectUpdate = {};

  if (name) {
    newData.name = name;
  }

  if (description) {
    newData.description = description;
  }

  if (estimatedTime) {
    newData.estimatedTime = estimatedTime;
  }

  if (repository) {
    newData.repository = repository;
  }

  if (startDate) {
    newData.startDate = startDate;
  }

  if (endDate) {
    newData.endDate = endDate;
  }

  if (developerId) {
    newData.developerId = developerId;
  }

  const queryString: string = format(
    `
            UPDATE projects
            SET (%I) = ROW (%L)
            WHERE id = $1
            RETURNING *;
        `,
    Object.keys(newData),
    Object.values(newData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResult: ProjectResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export const deleteProject = async (request: Request, response: Response) => {
  const id = Number(request.params.id);

  const queryString: string = `
            DELETE FROM projects
            WHERE id = $1;
        `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};

export const deleteProjectTechnology = async (
  request: Request,
  response: Response
) => {
  const options: Technologies[] = [
    "JavaScript",
    "Python",
    "React",
    "Express.js",
    "HTML",
    "CSS",
    "Django",
    "PostgreSQL",
    "MongoDB",
  ];

  const { name } = request.params;

  const isAOption = options.some((option) => name === option);

  if (!isAOption) {
    return response.status(400).json({
      message: "Technology not supported.",
      options: options,
    });
  }

  let queryString: string = `
    SELECT t.id
    FROM technologies t
    WHERE t.name = $1;
  `;

  let queryConfig: QueryConfig = {
    text: queryString,
    values: [name],
  };

  let queryResult: QueryResult = await client.query(queryConfig);

  const technologyId = Number(queryResult.rows[0].id);
  const projectId = Number(request.params.id);

  queryString = `
    DELETE FROM projects_technologies
    WHERE "projectId" = $1 AND "technologyId" = $2;
    `;

  queryConfig = {
    text: queryString,
    values: [projectId, technologyId],
  };

  queryResult = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(404).json({
      message: `Technology ${name} not found on this Project.`,
    });
  }

  return response.status(204).send();
};
