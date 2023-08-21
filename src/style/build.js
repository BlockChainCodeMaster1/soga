import colors from 'colors-console'
import { appendFile, existsSync, readdir, stat, unlink } from 'fs'
import { dirname, extname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function error(label, err) {
  return console.error(colors(['red'], label), err)
}

const matchExtNames = ['.scss']
const targetPath = resolve(__dirname)
const outputPath = resolve(__dirname, './index.scss')

function writeFileFunc(filePath) {
  readdir(filePath, function (err, files) {
    if (err) {
      error('Error: \n %s', err)
    } else {
      files.forEach((fileName) => {
        const fullFilePath = join(filePath, fileName)
        stat(fullFilePath, function (err, status) {
          if (err) {
            error('Error: \n %s', err)
          } else {
            const _extname = extname(fullFilePath)
            if (status.isFile() && matchExtNames.includes(_extname)) {
              appendFile(outputPath, `@import "${fullFilePath.replace(`${__dirname}/`, '')}";\n`, function (err) {
                if (err) error('Error: \n %s', err)
              })
            }
            if (status.isDirectory()) writeFileFunc(fullFilePath)
          }
        })
      })
    }
  })
}

function main() {
  const exists = existsSync(outputPath)
  if (exists) {
    unlink(outputPath, function (err) {
      if (err) {
        error('Error: \n %s', err)
      } else {
        writeFileFunc(targetPath)
      }
    })
  } else {
    writeFileFunc(targetPath)
  }
}

main()
