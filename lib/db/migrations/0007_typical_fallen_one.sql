ALTER TABLE "User" ADD COLUMN "workosId" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "User_workosId_idx" ON "User" USING btree ("workosId");--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_workosId_unique" UNIQUE("workosId");