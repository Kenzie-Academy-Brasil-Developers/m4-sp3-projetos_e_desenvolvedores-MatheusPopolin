import { Client } from "pg";

const client = new Client({
  user: "User",
  password: "176767",
  host: "localhost",
  database: "m4_sp3",
  port: 5432,
});

export default client;
