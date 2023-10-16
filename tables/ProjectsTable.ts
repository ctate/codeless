import { ColumnType, Generated, sql } from 'kysely'

import { db } from '@/lib/db'

export interface ProjectsTable {
  id: Generated<number>
  latestVersion: number;
  name: string
  slug: string
  starCount?: number
  ownerUserId: number
  createdAt: ColumnType<Date, string | undefined, never>
}

export const createProjectsTable = async () => {
  await db.schema
    .createTable('projects')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('latestVersion', 'integer', (cb) => cb.notNull())
    .addColumn('name', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('slug', 'varchar(255)', (cb) => cb.notNull().unique())
    .addColumn('starCount', 'integer', (cb) => cb.notNull().defaultTo(0))
    .addColumn('ownerUserId', 'integer', (cb) => cb.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`)
    )
    .execute()
}
