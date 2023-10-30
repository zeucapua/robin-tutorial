import { html } from "hono/html";
export const SiteLayout = (props: { children: any }) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://unpkg.com/htmx.org@1.9.6"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="flex flex-col w-full h-full min-w-screen min-h-screen p-8 gap-8">
      <p>Test</p>
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
        class="px-4 py-2 border rounded-xl"
      />
      <button
        hx-post={`/htmx/project`}
        hx-trigger="click"
        hx-target="#tracker_list"
        hx-swap="afterbegin"
        hx-include="[name='new_project']"
        class="px-4 py-2 border rounded-xl"
      >
        Add
      </button>
    </div>
  );
}

export const Tracker = (props: { name: string, action: "start" | "end" }) => {
  return (
    <div class="flex flex-col gap-4 border rounded-xl px-8 py-4">
      <p>{props.name}</p>
      <Toggle name={props.name} action={props.action} />
    </div>
  );
}

export const Toggle = (props: { name: string, action: "start" | "end"}) => {
  return (
    <button
      type="button"
      hx-post={`/htmx/session/${props.name}`}
      hx-trigger="click"
      hx-swap="outerHTML"
    >
      {props.action}
    </button>
  );
}

