import { existsSync } from 'fs'
import { mkdir, rename, writeFile } from 'fs/promises'
import path from 'path'

export const saveData = async <T>(file: string, data: object) => {
  const dir = path.dirname(file)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  const tempFile = `${file}.${Math.random()}.tmp`
  await writeFile(tempFile, JSON.stringify(data, null, 2))
  await rename(tempFile, file)
}
