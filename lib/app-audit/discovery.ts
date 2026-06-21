import * as ts from 'typescript'
import fs from 'fs'
import path from 'path'
import { ApplicationInventory, AppArtifactMetadata, ArtifactType } from './types'

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList
  
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      getFilesRecursively(fullPath, fileList)
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        fileList.push(fullPath)
      }
    }
  }
  return fileList
}

function determineArtifactType(filePath: string, sourceFile: ts.SourceFile): ArtifactType {
  const normalizedPath = filePath.replace(/\\/g, '/')
  
  if (normalizedPath.includes('/app/api/') && normalizedPath.endsWith('route.ts')) {
    return 'api_route'
  }
  
  // Check for "use server" directive
  let isServerAction = false
  ts.forEachChild(sourceFile, node => {
    if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use server') {
      isServerAction = true
    }
  })
  if (isServerAction) return 'server_action'
  
  if (normalizedPath.endsWith('.tsx')) {
    return 'component'
  }
  
  if (normalizedPath.includes('/repositories/')) return 'repository'
  if (normalizedPath.includes('/services/')) return 'service'
  if (normalizedPath.includes('/schemas/')) return 'schema'
  if (normalizedPath.includes('/types') || normalizedPath.endsWith('types.ts')) return 'type'
  
  return 'unknown'
}

export function analyzeFileAST(filePath: string): AppArtifactMetadata {
  const content = fs.readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  )

  const type = determineArtifactType(filePath, sourceFile)
  
  const imports: { name: string; source: string }[] = []
  const exports: string[] = []
  let complexityScore = 0

  function visit(node: ts.Node) {
    complexityScore++

    // Imports
    if (ts.isImportDeclaration(node)) {
      const source = (node.moduleSpecifier as ts.StringLiteral).text
      
      if (node.importClause) {
        if (node.importClause.name) {
          imports.push({ name: node.importClause.name.text, source })
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach(el => {
              imports.push({ name: el.name.text, source })
            })
          }
        }
      }
    }

    // Exports
    if (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      if (node.name) exports.push(node.name.text)
    }
    if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      node.declarationList.declarations.forEach(d => {
        if (ts.isIdentifier(d.name)) exports.push(d.name.text)
      })
    }
    if (ts.isClassDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
       if (node.name) exports.push(node.name.text)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return {
    path: filePath,
    type,
    dependencies: Array.from(new Set(imports.map(i => i.source))),
    exports,
    imports,
    complexityScore,
    confidence: 100 // Fully parsed via AST
  }
}

export function runProjectDiscovery(): ApplicationInventory {
  const cwd = process.cwd()
  const targetDirs = ['app', 'lib', 'components']
  
  const allFiles: string[] = []
  targetDirs.forEach(dir => {
    getFilesRecursively(path.join(cwd, dir), allFiles)
  })

  const artifacts = allFiles.map(analyzeFileAST)

  const totalFiles = artifacts.length
  const totalApiRoutes = artifacts.filter(a => a.type === 'api_route').length
  const totalComponents = artifacts.filter(a => a.type === 'component').length
  const totalRepositories = artifacts.filter(a => a.type === 'repository').length
  
  const totalComplexity = artifacts.reduce((acc, a) => acc + a.complexityScore, 0)
  const averageComplexity = totalFiles > 0 ? Math.round(totalComplexity / totalFiles) : 0

  return {
    artifacts,
    metrics: {
      totalFiles,
      totalApiRoutes,
      totalComponents,
      totalRepositories,
      averageComplexity
    }
  }
}
