import ytdlp from 'yt-dlp-exec'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMP_DIR = path.join(__dirname, '../../temp')
const BIN_DIR = path.join(__dirname, '../../bin')
const UPLOADS_DIR = path.join(__dirname, '../../uploads')

// Garante que as pastas existem
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}
if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true })
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Configura o caminho do yt-dlp
const YT_DLP_PATH = process.platform === 'win32'
  ? path.join(BIN_DIR, 'yt-dlp.exe')
  : 'yt-dlp'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// Função para limpar arquivos temporários
const cleanupTempFiles = () => {
  try {
    console.log('🧹 Iniciando limpeza de arquivos temporários...')
    const now = Date.now()
    const ONE_HOUR = 3600000 // 1 hora em milissegundos

    // Limpa arquivos na pasta temp
    if (fs.existsSync(TEMP_DIR)) {
      fs.readdirSync(TEMP_DIR).forEach(file => {
        if (file === 'uploads') return // Ignora o diretório uploads
        
        const filePath = path.join(TEMP_DIR, file)
        const stats = fs.statSync(filePath)
        
        if (now - stats.mtimeMs > ONE_HOUR) {
          try {
            if (fs.statSync(filePath).isDirectory()) {
              fs.rmdirSync(filePath, { recursive: true })
            } else {
              fs.unlinkSync(filePath)
            }
            console.log(`✅ Arquivo removido: ${file}`)
          } catch (err) {
            console.error(`❌ Erro ao remover arquivo ${file}:`, err)
          }
        }
      })
    }

    // Limpa arquivos na pasta uploads
    if (fs.existsSync(UPLOADS_DIR)) {
      fs.readdirSync(UPLOADS_DIR).forEach(file => {
        const filePath = path.join(UPLOADS_DIR, file)
        const stats = fs.statSync(filePath)
        
        if (now - stats.mtimeMs > ONE_HOUR) {
          try {
            if (!fs.statSync(filePath).isDirectory()) {
              fs.unlinkSync(filePath)
              console.log(`✅ Upload removido: ${file}`)
            }
          } catch (err) {
            console.error(`❌ Erro ao remover upload ${file}:`, err)
          }
        }
      })
    }
  } catch (error) {
    console.error('❌ Erro na limpeza de arquivos temporários:', error)
  }
}

// Executa limpeza a cada hora
setInterval(cleanupTempFiles, 3600000)
cleanupTempFiles() // Executa limpeza inicial

const downloads = new Map()

export const downloadService = {
  async getVideoInfo(url) {
    try {
      // Verifica se a URL é válida
      if (!url || typeof url !== 'string') {
        throw new Error('URL inválida')
      }

      const args = [
        url,
        '--dump-json',
        '--no-check-certificates',
        '--no-warnings',
        '--prefer-free-formats'
      ]

      const result = await ytdlp.exec(args)
      const info = JSON.parse(result.stdout)

      return {
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        formats: info.formats.map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          resolution: f.resolution,
          filesize: f.filesize,
          acodec: f.acodec,
          vcodec: f.vcodec,
        }))
      }
    } catch (error) {
      console.error('Erro ao obter informações:', error)
      throw new Error('Falha ao obter informações do vídeo')
    }
  },

  async startDownload(url, format, quality, downloadId) {
    try {
      const sanitizedId = downloadId.replace(/[^a-zA-Z0-9]/g, '')
      const timestamp = Date.now()
      const outputTemplate = `${sanitizedId}-${timestamp}`
      const outputPath = path.join(TEMP_DIR, `${outputTemplate}.%(ext)s`)

      console.log(`\n🚀 Iniciando download: ${url}`)
      console.log(`📁 Formato: ${format}, Qualidade: ${quality}`)

      downloads.set(downloadId, { 
        progress: 0, 
        status: 'downloading',
        startTime: timestamp
      })

      // Corrigindo os argumentos do yt-dlp
      const args = [
        '--no-colors',
        '--progress',
        '--newline',
        '--no-playlist',
        '--no-check-certificates',
        '--no-warnings',
        '--extract-audio',
        '--audio-format', format.toLowerCase(),
        '--audio-quality', '0',
        '-o', outputPath,
        url
      ]

      if (format === 'MP3') {
        args.push('--extract-audio', '--audio-format', 'mp3')
        if (quality === '320kbps') args.push('--audio-quality', '0')
        else if (quality === '256kbps') args.push('--audio-quality', '1')
        else if (quality === '128kbps') args.push('--audio-quality', '5')
      }

      console.log('⚙️ Argumentos:', args)

      return new Promise((resolve, reject) => {
        let outputFile = null
        let lastProgress = 0

        const ytdlpProcess = ytdlp.exec(args, {
          stdout: (output) => {
            console.log('📤 Output:', output)
            
            // Melhor captura do progresso
            const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/)
            if (progressMatch) {
              const progress = parseFloat(progressMatch[1])
              if (progress > lastProgress) {
                lastProgress = progress
                downloads.set(downloadId, {
                  progress,
                  status: 'downloading',
                  startTime: timestamp
                })
              }
            }

            // Captura do arquivo de saída
            if (output.includes(TEMP_DIR)) {
              outputFile = output.trim()
            }
          },
          stderr: (error) => {
            console.error('❌ Erro:', error)
          }
        })

        ytdlpProcess.then(() => {
          // Procura o arquivo após o download
          const files = fs.readdirSync(TEMP_DIR)
          const downloadedFile = files.find(file => file.startsWith(sanitizedId))
          
          if (downloadedFile) {
            const filePath = path.join(TEMP_DIR, downloadedFile)
            console.log('📂 Arquivo baixado:', filePath)
            
            const downloadStatus = {
              progress: 100,
              status: 'completed',
              file: filePath,
              downloadUrl: `/temp/${downloadedFile}`
            }
            
            downloads.set(downloadId, downloadStatus)
            resolve(downloadStatus)
          } else {
            reject(new Error('Arquivo não encontrado após download'))
          }
        }).catch(reject)
      })
    } catch (error) {
      console.error('❌ Erro no download:', error)
      downloads.set(downloadId, {
        status: 'error',
        error: error.message,
        startTime: Date.now()
      })
      throw error
    }
  },

  findDownloadedFile(template) {
    try {
      const files = fs.readdirSync(TEMP_DIR)
      const matchingFile = files.find(file => file.startsWith(template))
      if (matchingFile) {
        return path.join(TEMP_DIR, matchingFile)
      }
      console.log(`🔍 Arquivos na pasta temp:`, files)
      return null
    } catch (error) {
      console.error('❌ Erro ao procurar arquivo:', error)
      return null
    }
  },

  cleanupDownload(downloadId, filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`Arquivo removido: ${filePath}`)
      }
      downloads.delete(downloadId)
    } catch (error) {
      console.error(`Erro ao limpar download ${downloadId}:`, error)
    }
  },

  getProgress(downloadId) {
    const download = downloads.get(downloadId)
    if (!download) return { status: 'not_found' }

    // Se o download estiver completo, inclui o URL para download
    if (download.status === 'completed' && download.file) {
      return {
        ...download,
        downloadUrl: `/temp/${path.basename(download.file)}`
      }
    }

    return download
  },

  getFormatString(format, quality) {
    const formatMap = {
      'MP4': {
        '2160p': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]',
        '1440p': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]',
        '1080p': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        '720p': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
        '480p': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
        '360p': 'bestvideo[height<=360]+bestaudio/best[height<=360]'
      },
      'MP3': {
        '320kbps': 'bestaudio/best',
        '256kbps': 'bestaudio/best',
        '128kbps': 'worstaudio/worst'
      },
      'WAV': 'bestaudio/best',
      'M4A': 'bestaudio/best'
    }

    return formatMap[format]?.[quality] || formatMap[format] || 'best'
  }
}