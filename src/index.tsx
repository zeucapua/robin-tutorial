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

// load components from 'components.tsx'
import { ProjectCreator, Refresher, SessionRow, SiteLayout, Tracker } from './components';

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

// ---------------------------------------

/* 🛣️ Route Endpoints */

// GET index page
app.get("/", async (c) => {
  // get all projects and their latest session
  const projects = await database.query.projects.findMany({
    with: {
      sessions: {
        limit: 1,
        orderBy: desc(schema.sessions.start)
      }
    }
  });

  // get all sessions for table and project aggregate
  const sessions = await database.query.sessions.findMany({
    orderBy: desc(schema.sessions.start)
  });


  // return HTML response 
	return c.html(
    <SiteLayout>
      <h1 class="text-3xl font-bold">Robin Demo by <a href="https://zeu.dev">Zeu</a></h1>
      <ProjectCreator />
      <div id="tracker_list" class="flex flex-wrap gap-8">
        { 
          projects.map((p) => {
            if (p.sessions.length === 0 || p.sessions[0].end) {
              return <Tracker name={p.name ?? ""} action="start" />
            }
            else { return <Tracker name={p.name ?? ""} action="end" /> }
          })
        }
      </div>

      <button 
        type="button"
        hx-trigger="click"
        hx-patch="/htmx/refreshSessions"
        hx-target="#session_rows"
        hx-swap="outerHTML"
        class="px-4 py-2 border rounded-xl bg-sky-500"
      >
        Refresh
      </button>
      <table class="table-auto text-start">
        <thead>
          <tr>
            <th>Duration</th>
            <th>Project</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody id="session_rows">
          {
            sessions.map((s) => {
              if (s && (s.start && s.end)) {
                const min_duration = ((s.end?.valueOf() - s.start?.valueOf()) / (60 * 1000));
                const duration_string = (min_duration < 1) ? 
                  `${(min_duration * 60).toFixed(2)} seconds` 
                  : `${(min_duration).toFixed(2)} minutes`;
                return <SessionRow session={s} duration={duration_string} />
              }
            })
          }
        </tbody>
      </table>
    </SiteLayout>
	);
});


// GET project by name
app.get("/api/project/:name", async (c) => {
  // get route parameter (denoted with ':')
  const name = c.req.param("name") as string;

  // query database to find project with name
  const result = await database.query.projects.findFirst({
    where: eq(schema.projects.name, name),
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
  return c.json({ result: result[0] });
});


// GET latest session under project name
app.get("/api/session/:name", async (c) => {
  const name = c.req.param("name") as string;
  
  // get latest session
  const latest = await database.query.sessions.findFirst({
    where: eq(schema.sessions.projectName, name),
    orderBy: [desc(schema.sessions.start)]
  });


  // return null if latest is undefined
  return c.json({ result: latest ?? null });
});


// POST create a new session under project name
app.post("/api/session/:name", async (c) => {
  const name = c.req.param("name") as string;

  // get latest session
  const latest = await database.query.sessions.findFirst({
    where: eq(schema.sessions.projectName, name),
    orderBy: [desc(schema.sessions.start)]
  });

  // if no session OR latest already has an end time, then create a new session
  // otherwise end the current session
  if (!latest || latest.end !== null) {
    const result = await database
      .insert(schema.sessions)
      .values({ projectName: name })
      .returning();

    return c.json({ result: result[0] });
  }
  else {
    const updated = await database
      .update(schema.sessions)
      .set({ end: new Date })
      .where( eq(schema.sessions.id, latest.id) )
      .returning();

    return c.json({ result: updated[0] });
  }
});


// POST create a project and return a <Tracker> component
app.post("/htmx/createProject", async (c) => {
  const data = await c.req.parseBody();
  const project_name = data.new_project as string;

  if (project_name.length > 0) {
    // create a new project
    await database
      .insert(schema.projects)
      .values({ name: project_name });

    return c.html(
      <Tracker name={project_name} action="start" />
    );
  }
});


// PATCH toggle a session by project's name and return a Tracker component
app.patch("/htmx/toggleSession/:name", async (c) => {
  const name = c.req.param("name") as string;

  // get latest session
  const latest = await database.query.sessions.findFirst({
    where: eq(schema.sessions.projectName, name),
    orderBy: [desc(schema.sessions.start)]
  });

  // if no session OR latest already has an end time, then create a new session
  // otherwise end the current session
  if (!latest || latest.end !== null) {
    await database
      .insert(schema.sessions)
      .values({ projectName: name });

    return c.html(
      <Tracker name={name} action="end" />
    )
  }
  else {
    await database
      .update(schema.sessions)
      .set({ end: new Date })
      .where( eq(schema.sessions.id, latest.id) );

    return c.html(
      <Tracker name={name} action="start" />
    )
  }
});

app.delete("/htmx/deleteProject/:name", async (c) => {
  const name = c.req.param("name") as string;
  
  await database
    .delete(schema.projects)
    .where( eq(schema.projects.name, name) );

  // for htmx to swap, then delete??
  return c.html(<div />);
});


app.patch("/htmx/refreshSessions", async (c) => {
  // get all sessions for table and project aggregate
  const sessions = await database.query.sessions.findMany({
    orderBy: desc(schema.sessions.start)
  });

  return c.html(
    <tbody id="session_rows">
      {
        sessions.map((s) => {
          if (s && (s.start && s.end)) {
            const min_duration = ((s.end?.valueOf() - s.start?.valueOf()) / (60 * 1000));
            const duration_string = (min_duration < 1) ? 
              `${(min_duration * 60).toFixed(2)} seconds` 
              : `${(min_duration).toFixed(2)} minutes`;
            return <SessionRow session={s} duration={duration_string} />
          }
        })
      }
    </tbody>
  );
});


app.delete("/htmx/deleteSession/:id", async (c) => {
  const id = c.req.param("id") as string;

  await database
    .delete(schema.sessions)
    .where( eq(schema.sessions.id, Number.parseInt(id)) );

  // for htmx to swap, then delete??
  return c.html(<div />);
});


export default app;

// ---------------------------------------

/* 🚀 Deployment */

// use `.env` set PORT, for Railway deployment
const PORT = Number(process.env.PORT) || 3000;

// become a server, to deploy as Node.js app on Railway
serve({
	fetch: app.fetch,
	port: PORT
});
