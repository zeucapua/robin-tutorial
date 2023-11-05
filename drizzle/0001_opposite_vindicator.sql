DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_project_name_projects_name_fk" FOREIGN KEY ("project_name") REFERENCES "projects"("name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
