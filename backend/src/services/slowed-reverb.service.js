import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { downloadService } from './download.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMP_DIR = path.join(__dirname, '../../temp')
const UPLOADS_DIR = path.join(TEMP_DIR, 'uploads')

// Garante que as pastas existem
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const conversions = new Map()

export const slowedReverbService = {
  async startConversion(input, conversionId, isYouTube = false) {
    try {
      console.log(`\n🎵 Iniciando processamento: ${input}`)
      
      conversions.set(conversionId, {
        progress: 0,
        status: 'initializing',
        startTime: Date.now()
      })

      let audioPath = input
      
      if (isYouTube) {
        console.log('⬇️ Baixando áudio do YouTube...')
        conversions.set(conversionId, {
          progress: 0,
          status: 'downloading',
          startTime: Date.now()
        })

        const downloadResult = await downloadService.startDownload(input, 'MP3', '320kbps', conversionId)
        audioPath = downloadResult.file
        if (!path.isAbsolute(audioPath)) {
          audioPath = path.join(TEMP_DIR, audioPath)
        }
        console.log('✅ Download concluído:', audioPath)
      }

      if (!fs.existsSync(audioPath)) {
        throw new Error(`Arquivo de áudio não encontrado: ${audioPath}`)
      }

      // Retorna o arquivo para processamento no frontend
      const status = {
        progress: 100,
        status: 'completed',
        file: audioPath,
        downloadUrl: `/temp/${path.basename(audioPath)}`,
        startTime: Date.now()
      }
      conversions.set(conversionId, status)
      return status

    } catch (error) {
      console.error('Erro na conversão:', error)
      conversions.set(conversionId, {
        status: 'error',
        error: error.message,
        startTime: Date.now()
      })
      throw error
    }
  },

  getProgress(conversionId) {
    return conversions.get(conversionId) || null
  }
} 