import { html } from "hono/html";
import type { sessions } from "./schema";
export const SiteLayout = (props: { children: any }) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://unpkg.com/htmx.org@1.9.6"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="text-white flex flex-col w-full h-full min-w-screen min-h-screen bg-neutral-800 p-8 gap-8">
      ${props.children}
    </body>
  </html>
`


export const ProjectCreator = () => {
  return (
    <div class="flex gap-4">
      <input 
        type="text"
        name="new_project"
        placeholder="Enter new project..."
        class="px-4 py-2 border rounded-xl text-black"
      />
      <button
        type="button"
        hx-trigger="click"
        hx-post="/htmx/createProject"
        hx-include="[name='new_project']"
        hx-target="#tracker_list"
        hx-swap="beforeend"
        class="px-4 py-2 border rounded-xl"
      >
        Add
      </button>
    </div>
  );
}

export const Tracker = (props: { name: string, action: "start" | "end" }) => {
  return (
    <div id={`tracker_${props.name}`} class={`flex flex-col gap-4 border rounded-xl px-8 py-4 ${props.action === 'end' ? "bg-neutral-600" : ""}`}>
      <h1 class="text-xl font-bold">{props.name}</h1>
      <button
        type="button"
        hx-trigger="click"
        hx-patch={`/htmx/toggleSession/${props.name}`}
        hx-target={`#tracker_${props.name}`}
        hx-swap="outerHTML"
        class="px-4 py-2 border rounded-xl bg-emerald-600"
      >
        {props.action}
      </button>
      <button 
        type="button"
        hx-trigger="click"
        hx-delete={`/htmx/deleteProject/${props.name}`}
        hx-confirm={`Do you want to delete this project (${props.name})?`}
        hx-target={`#tracker_${props.name}`}
        hx-swap="delete" 
        class="px-4 py-2 border rounded-xl bg-red-600"
      >
        Delete
      </button>
    </div>
  );
}

export const SessionRow = (props: { session: typeof sessions.$inferSelect, duration: string }) => {
  return (
    <tr id={`session_${props.session.id}`}>
      <td>{props.duration}</td>
      <td>{props.session.projectName}</td>
      <td>{props.session.start?.toLocaleString()}</td>
      <td>{props.session.end?.toLocaleString()}</td>
      <td>
        <button
          type="button"
          hx-trigger="click"
          hx-delete={`/htmx/deleteSession/${props.session.id}`}
          hx-confirm="Are you sure?"
          hx-target={`#session_${props.session.id}`}
          hx-swap="delete"
          class="px-4 py-2 border rounded-xl bg-red-600"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};
