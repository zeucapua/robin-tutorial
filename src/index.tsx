// ---------------------------------------

/* 🪂 Import packages (installed via npm/pnpm) */

// Hono packages
import { Hono } from 'hono';
import { serve } from "@hono/node-server";

// Database Driver
import { Pool } from "pg";

// Drizzle ORM packages
import * as schema from "./schema";
import { desc, eq } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/node-postgres";

// loads environment variables from `.env`
import "dotenv/config";

// ---------------------------------------

/* 🏗️ Configure Hono Web Application */

// initialize web application 
const app = new Hono();

// create pool connection to database 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// initialize ORM client with schema types
const database = drizzle(pool, { schema });

/* 🛣️ Route Endpoints */

// GET index page
app.get("/", async (c) => {
	return c.html(
		<h1>Hello world!</h1>
	);
});


// GET project by name
app.get("/api/project/:name", async (c) => {
  // get route parameter (denoted with ':')
  const name = c.req.param("name") as string;

  // query database to find project with name
  const result = await database.query.projects.findFirst({
    where: eq(schema.projects.name, name)
  });

  // return JSON response
  return c.json({ result });
});

// POST create project with name 
app.post("/api/project/:name", async (c) => {
  // get route parameter (denoted with ':')
  const name = c.req.param("name") as string;

  // create a new project
  const result = await database
    .insert(schema.projects)
    .values({ name })
    .returning();

  // return JSON response
  return c.json({ result });
});

export default app;

// ---------------------------------------

/* Deployment */

// use `.env` set PORT, for Railway deployment
const PORT = Number(process.env.PORT) || 3000;

// become a server, to deploy as Node.js app on Railway
serve({
	fetch: app.fetch,
	port: PORT
});
