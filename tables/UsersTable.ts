import { ColumnType, Generated, sql } from 'kysely'

import { db } from '@/lib/db'

export interface UsersTable {
  id: Generated<number>
  imageUrl: string
  name: string
  username: string
  createdAt: ColumnType<Date, string | undefined, never>
}

export const createUsersTable = async () => {
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('imageUrl', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('name', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('username', 'varchar(255)', (cb) => cb.notNull().unique())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`)
    )
    .execute()
}
