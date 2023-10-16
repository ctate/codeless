import { ColumnType, sql } from 'kysely'

import { db } from '@/lib/db'

export interface ProjectStarsTable {
  projectId: number
  userId: number
  createdAt: ColumnType<Date, string | undefined, never>
}

export const createProjectStarsTable = async () => {
  await db.schema
    .createTable('projectStars')
    .ifNotExists()
    .addColumn('projectId', 'integer', (cb) => cb.notNull())
    .addColumn('userId', 'integer', (cb) => cb.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`)
    )
    .addUniqueConstraint('projectStars_projectId_userId_unique', [
      'projectId',
      'userId',
    ])
    .execute()
}
