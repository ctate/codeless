import { ColumnType, Generated, sql } from 'kysely'

import { db } from '@/lib/db'

export interface ProjectVersionsTable {
  projectId: number
  number: number
  prompt: string
  codeUrl: string
  imageUrl: string
  messagesUrl: string
  createdAt: ColumnType<Date, string | undefined, never>
}

export const createProjectVersionsTable = async () => {
  await db.schema
    .createTable('projectVersions')
    .ifNotExists()
    .addColumn('projectId', 'integer', (cb) => cb.notNull())
    .addColumn('number', 'integer', (cb) => cb.notNull())
    .addColumn('prompt', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('codeUrl', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('imageUrl', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('messagesUrl', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`)
    )
    .addUniqueConstraint('projectId_versionNumber_unique', ['projectId', 'number'])
    .execute()
}
