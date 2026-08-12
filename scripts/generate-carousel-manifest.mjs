import { promises as fs } from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const carouselDir = path.join(projectRoot, 'public', 'carousel')
const outputFile = path.join(carouselDir, 'results-manifest.json')

const files = await fs.readdir(carouselDir)

const results = files
  .map((file) => {
    const match = file.match(/^(\d+)-(.+)\.svg$/i)

    if (!match) {
      return null
    }

    const index = Number(match[1])
    const slug = match[2]

    // Keep only the numbered final SVG results.
    if (
      index < 1
      || index > 42
      || /(?:^|[_-])draft(?:[_-]|$)/i.test(slug)
    ) {
      return null
    }

    return {
      index,
      file,
      slug
    }
  })
  .filter(Boolean)
  .sort((a, b) => a.index - b.index)

const duplicateIndices = results
  .filter((item, itemIndex, array) => {
    return array.findIndex((candidate) => candidate.index === item.index) !== itemIndex
  })
  .map((item) => item.index)

if (duplicateIndices.length > 0) {
  throw new Error(
    `Duplicate numbered SVG files found for indices: ${[...new Set(duplicateIndices)].join(', ')}`
  )
}

const missingIndices = Array.from(
  { length: 42 },
  (_, index) => index + 1
).filter((index) => {
  return !results.some((item) => item.index === index)
})

if (missingIndices.length > 0) {
  console.warn(
    `Warning: missing SVG indices: ${missingIndices.join(', ')}`
  )
}

await fs.writeFile(
  outputFile,
  `${JSON.stringify(results, null, 2)}\n`,
  'utf8'
)

console.log(
  `Generated ${path.relative(projectRoot, outputFile)} with ${results.length} SVG entries.`
)
