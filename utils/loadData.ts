import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

export const loadData = async <T>(file: string) => {
  const data = existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : {}

  return data as T
}
