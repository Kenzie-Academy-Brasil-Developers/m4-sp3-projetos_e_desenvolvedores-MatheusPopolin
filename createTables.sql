CREATE TYPE OS AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos(
	"id" SERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" OS NOT NULL
);

CREATE TABLE IF NOT EXISTS developers(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) NOT NULL UNIQUE,
	"developerInfoId" INTEGER UNIQUE
);

CREATE TABLE IF NOT EXISTS projects(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE
);

CREATE TABLE IF NOT EXISTS technologies(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

INSERT INTO technologies (name) VALUES 
('JavaScript'),
('Python'),
('React'),
('Express.js'),
('HTML'),
('CSS'),
('Django'),
('PostgreSQL'),
('MongoDB')
RETURNING * ;

CREATE TABLE IF NOT EXISTS projects_technologies(
	"id" SERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL
);

ALTER TABLE developer_infos  ADD COLUMN "developerId" INTEGER NOT NULL UNIQUE;

ALTER TABLE developer_infos  
ADD CONSTRAINT fk_developer_infos 
FOREIGN KEY("developerId") 
REFERENCES developers("id");
   
ALTER TABLE developer_infos  DROP CONSTRAINT fk_developer_infos;

ALTER TABLE developer_infos  
ADD CONSTRAINT fk_developer_infos 
FOREIGN KEY("developerId") 
REFERENCES developers("id")
ON DELETE CASCADE;

ALTER TABLE projects ADD COLUMN "developerId" INTEGER;

ALTER TABLE projects  
ADD CONSTRAINT fk_developer_projects 
FOREIGN KEY("developerId") 
REFERENCES developers("id");

ALTER TABLE projects_technologies  ADD COLUMN "projectId" INTEGER;

ALTER TABLE projects_technologies  
ADD CONSTRAINT fk_projects_id 
FOREIGN KEY("projectId") 
REFERENCES projects("id");

ALTER TABLE projects_technologies  ADD COLUMN "technologyId" INTEGER;

ALTER TABLE projects_technologies  
ADD CONSTRAINT fk_technology_id 
FOREIGN KEY("technologyId") 
REFERENCES technologies("id");