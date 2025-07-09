import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function createTestDb() {
  // Create in-memory PGlite database
  const client = new PGlite();

  // Create drizzle instance
  const db = drizzle(client, { schema });

  try {
    await migrate(db, {
      migrationsFolder: './lib/db/migrations',
    });
    const tables = await db.execute(sql`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `);
    console.log(
      '📋 Tables created:',
      tables.rows.map((r) => r.tablename),
    );
    console.log('✅ Test database migrations completed');
  } catch (error) {
    console.error('❌ Test database migration failed:', error);
    throw error;
  }

  return { db, client };
}

export async function resetTestDb(db: any) {
  // Use the correct table names from your schema
  await db.execute(sql`
    TRUNCATE TABLE "Vote_v2", "Message_v2", "Stream", "Suggestion", "Document", "Chat", "User" RESTART IDENTITY CASCADE;
  `);
}
