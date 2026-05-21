import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

function listFiles(dir) {
  if (!existsSync(dir)) return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) return listFiles(fullPath)
    if (entry.isFile()) return [fullPath]
    return []
  })
}

function assertFile(path) {
  if (!existsSync(path) || !statSync(path).isFile()) {
    throw new Error(`Missing required build file: ${relative(root, path)}`)
  }
}

function assertMirroredTree(sourceDir, distDir, label) {
  const sourceFiles = listFiles(sourceDir).map((file) => relative(sourceDir, file)).sort()
  const distFiles = listFiles(distDir).map((file) => relative(distDir, file)).sort()

  if (sourceFiles.length !== distFiles.length) {
    throw new Error(`${label} file count mismatch: public=${sourceFiles.length}, dist=${distFiles.length}`)
  }

  for (let index = 0; index < sourceFiles.length; index += 1) {
    if (sourceFiles[index] !== distFiles[index]) {
      throw new Error(`${label} file mismatch: public=${sourceFiles[index]}, dist=${distFiles[index]}`)
    }

    const sourcePath = join(sourceDir, sourceFiles[index])
    const distPath = join(distDir, distFiles[index])
    if (sha256(sourcePath) !== sha256(distPath)) {
      throw new Error(`${label} hash mismatch: ${sourceFiles[index]}`)
    }
  }

  return sourceFiles.length
}

function gitShow(refPath) {
  try {
    return execFileSync('git', ['show', refPath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return null
  }
}

const publicProvider = join(root, 'public/pages/providers.html')
const distProvider = join(root, 'dist/pages/providers.html')
const publicLatestMedia = join(root, 'public/assets/latest-media')
const distLatestMedia = join(root, 'dist/assets/latest-media')
const publicProviderProducts = join(root, 'public/pages/assets/provider-products')
const distProviderProducts = join(root, 'dist/pages/assets/provider-products')

assertFile(publicProvider)
assertFile(distProvider)

const publicProviderHash = sha256(publicProvider)
const distProviderHash = sha256(distProvider)

if (publicProviderHash !== distProviderHash) {
  throw new Error('Provider page mismatch: dist/pages/providers.html does not match public/pages/providers.html')
}

const joeProvider = gitShow('origin/joe:public/pages/providers.html')
if (joeProvider) {
  const joeProviderHash = createHash('sha256').update(joeProvider).digest('hex')
  if (joeProviderHash !== distProviderHash) {
    throw new Error('Provider page mismatch: dist/pages/providers.html does not match origin/joe')
  }
}

const latestMediaCount = assertMirroredTree(publicLatestMedia, distLatestMedia, 'latest-media')
const providerProductCount = assertMirroredTree(publicProviderProducts, distProviderProducts, 'provider-products')

console.log(`Hostinger build verified:`)
console.log(`- providers.html sha256 ${distProviderHash.slice(0, 12)}`)
console.log(`- latest-media files ${latestMediaCount}`)
console.log(`- provider-products files ${providerProductCount}`)
