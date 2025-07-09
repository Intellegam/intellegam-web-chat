ALTER TABLE "Chat" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "Document" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "Message_v2" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "Message" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "Stream" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "Suggestion" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "User" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "User" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_fk";
--> statement-breakpoint
ALTER TABLE "Document" DROP CONSTRAINT "Document_id_createdAt_pk";--> statement-breakpoint
ALTER TABLE "Document" ADD CONSTRAINT "Document_id_created_at_pk" PRIMARY KEY("id","created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_documentId_documentCreatedAt_Document_id_created_at_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","created_at") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
