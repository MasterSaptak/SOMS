import fs from 'fs'
import path from 'path'

export interface ScannedFile {
  filePath: string;
  content: string;
  lines: string[];
}

export function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles

  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

export function getApiRoutes(): ScannedFile[] {
  const apiDir = path.join(process.cwd(), 'app', 'api')
  const files = getAllFiles(apiDir)
  
  const routeFiles = files.filter(f => f.endsWith('route.ts') || f.endsWith('route.js'))
  
  return routeFiles.map(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8')
    return {
      filePath,
      content,
      lines: content.split('\n')
    }
  })
}
