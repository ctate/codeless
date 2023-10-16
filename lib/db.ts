import { createKysely } from '@vercel/postgres-kysely'

import { ProjectsTable, createProjectsTable } from '@/tables/ProjectsTable'
import {
  ProjectStarsTable,
  createProjectStarsTable,
} from '@/tables/ProjectStarsTable'
import {
  ProjectVersionsTable,
  createProjectVersionsTable,
} from '@/tables/ProjectVersionsTable'
import { UsersTable, createUsersTable } from '@/tables/UsersTable'

export interface Database {
  projects: ProjectsTable
  projectStars: ProjectStarsTable
  projectVersions: ProjectVersionsTable
  users: UsersTable
}

export const db = createKysely<Database>()

export const deinit = async () => {
  const tables = ['projects', 'projectStars', 'projectVersions', 'users']

  for (let i = 0; i < tables.length; i++) {
    await db.schema.dropTable(tables[i]).ifExists().execute()
  }
}

export const init = async () => {
  await createProjectsTable()
  await createProjectStarsTable()
  await createProjectVersionsTable()
  await createUsersTable()
}

export const seed = async () => {}
