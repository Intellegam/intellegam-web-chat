import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@/lib/db/schema';

export async function createTestDb() {
  // Create in-memory PGlite database
  const client = new PGlite();

  // Create drizzle instance
  const db = drizzle(client, { schema });

  try {
    // Run your existing migrations - they work directly with PGlite!
    await migrate(db, {
      migrationsFolder: './lib/db/migrations',
    });
    console.log('✅ Test database migrations completed');
  } catch (error) {
    console.error('❌ Test database migration failed:', error);
    throw error;
  }

  return { db, client };
}

// Helper to reset database between tests
export async function resetTestDb(db: any) {
  // Delete all data but keep schema
  await db.execute(`
    TRUNCATE TABLE vote, message, stream, suggestion, document, chat, "user" RESTART IDENTITY CASCADE;
  `);
}
