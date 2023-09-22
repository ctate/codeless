import { lstatSync } from 'fs'
import { readdir } from 'fs/promises'

export const listFiles = async (dir: string) => {
  const items = await readdir(dir)

  const files = items.filter((file) => lstatSync(`${dir}/${file}`).isFile())

  return files
}
