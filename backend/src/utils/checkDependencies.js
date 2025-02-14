import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const BIN_DIR = path.join(__dirname, '../../bin')
const YT_DLP_PATH = path.join(BIN_DIR, 'yt-dlp.exe')

export async function checkDependencies() {
  // Verifica se a pasta bin existe
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true })
  }

  // Verifica se o yt-dlp está instalado
  try {
    if (process.platform === 'win32') {
      if (!fs.existsSync(YT_DLP_PATH)) {
        console.log('⚠️ yt-dlp não encontrado na pasta bin')
        console.log('Por favor, baixe o yt-dlp.exe de https://github.com/yt-dlp/yt-dlp/releases')
        console.log('e coloque-o na pasta backend/bin/')
        process.exit(1)
      }
    } else {
      await execAsync('which yt-dlp')
    }
    console.log('✅ yt-dlp encontrado')
  } catch (error) {
    console.log('⚠️ yt-dlp não encontrado no sistema')
    console.log('Por favor, instale o yt-dlp:')
    console.log('Windows: winget install yt-dlp')
    console.log('Linux: sudo apt install yt-dlp')
    console.log('macOS: brew install yt-dlp')
    process.exit(1)
  }
} 