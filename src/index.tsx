// ---------------------------------------

/* 🪂Import packages (installed via npm/pnpm) */

// Hono packages
import { Hono } from 'hono';
import { serve } from "@hono/node-server";

// loads environment variables from `.env`, will be used later
import * as dotenv from "dotenv";
dotenv.config();

// ---------------------------------------

/* 🏗️Configure Hono Web Application */

// initialize web application
const app = new Hono();

/* 🛣️Route Endpoints */

// GET index page
app.get("/", async (c) => {
	return c.html(
		<h1>Hello world!</h1>
	);
});


// GET project by name
app.get("/api/project/:name", async (c) => {
  
});

// POST create project with name 
app.post("/api/project/:name", async (c) => {
  
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
