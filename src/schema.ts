// ---------------------------------------

/* Import packages (installed via npm/pnpm) */
// drizzle-orm packages
import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

// ---------------------------------------

/* Data Models */
// >> find more information on defining the schema:
// >> https://orm.drizzle.team/docs/sql-schema-declaration
export const projects = pgTable("projects", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).unique()
});

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	start: timestamp("start").defaultNow(),
	end: timestamp("end"),
	projectName: varchar("project_name").notNull()
});


/* Relationships Between Models */
// find more information on declaring relations:
// https://orm.drizzle.team/docs/rqb#declaring-relations
export const projects_relations = relations(projects, ({ many }) => ({
	sessions: many(sessions)
}));

export const sessions_relations = relations(sessions, ({ one }) => ({
	project: one(projects, {
		fields: [sessions.projectName],
		references: [projects.name]
	})
})); 

// ---------------------------------------
