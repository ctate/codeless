import { lstatSync } from 'fs'
import { readdir } from 'fs/promises'

export const listFolders = async (dir: string) => {
  const items = await readdir(dir)

  const files = items.filter((file) =>
    lstatSync(`${dir}/${file}`).isDirectory()
  )

  return files
}
