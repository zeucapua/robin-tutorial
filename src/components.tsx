export const SiteLayout = (props: { children: any }) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/htmx.org@1.9.6"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="flex flex-col w-full h-full min-w-screen min-h-screen p-8 gap-8">
        {props.children}
      </body>
    </html>
  );
};

export const ProjectCreator = (props: { name: string }) => {
  return (
    <div class="flex gap-4">
      <input 
        type="text"
        hx-post={`/htmx/project/${props.name}`}
        hx-trigger="click"
        hx-target="#tracker_list"
        hx-swap="afterbegin"
      />
    </div>
  );
}
