import express, { Application, json } from "express";
import { startDatabase } from "./database";
import {
  registerDeveloper,
  readAllDevelopers,
  readDeveloper,
  addDeveloperInfos,
  updateDeveloper,
  updateDeveloperInfos,
  deleteDeveloper,
} from "./logics/developers.logic";
import {
  registerProject,
  readAllProjects,
  readProject,
  updateProject,
  deleteProject,
  readDeveloperProjects,
  registerProjectTechnology,
  deleteProjectTechnology,
} from "./logics/projects.logic";
import {
  ensureDeveloperExists,
  ensureEmailIsUnused,
} from "./middlewares/developers.middlewares";
import {
  ensureProjectExists,
} from "./middlewares/projects.middlewares";

const app: Application = express();
app.use(json());

app.post("/developers", ensureEmailIsUnused, registerDeveloper);
app.get("/developers", readAllDevelopers);
app.get("/developers/:id", ensureDeveloperExists, readDeveloper);
app.get("/developers/:id/projects", ensureDeveloperExists, readDeveloperProjects);
app.patch("/developers/:id", ensureDeveloperExists, ensureEmailIsUnused, updateDeveloper);
app.delete("/developers/:id", ensureDeveloperExists, deleteDeveloper);
app.post("/developers/:id/infos", ensureDeveloperExists, addDeveloperInfos);
app.patch("/developers/:id/infos", ensureDeveloperExists, updateDeveloperInfos);


app.post("/projects", ensureDeveloperExists, registerProject);
app.get("/projects/:id", ensureProjectExists, readProject);
app.get("/projects", readAllProjects);
app.patch("/projects/:id", ensureProjectExists, ensureDeveloperExists, updateProject);
app.delete("/projects/:id", ensureProjectExists, deleteProject);
app.post("/projects/:id/technologies", ensureProjectExists, registerProjectTechnology); 
app.delete("/projects/:id/technologies/:name", ensureProjectExists, deleteProjectTechnology);

const PORT: number = 3000;
const runningMsg: string = `Server running on http://localhost:${PORT}`;

app.listen(PORT, async () => {
  await startDatabase();
  console.log(runningMsg);
});
