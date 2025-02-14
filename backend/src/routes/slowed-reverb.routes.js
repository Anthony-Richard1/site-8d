import express from 'express'
import { slowedReverbController } from '../controllers/slowed-reverb.controller.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '../../temp/uploads')

// Garante que a pasta de uploads existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const router = express.Router()

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('Arquivo inválido. Por favor, envie apenas arquivos de áudio ou vídeo.'))
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // Limite de 100MB
  }
})

router.post('/convert', upload.single('audio'), slowedReverbController.convert)
router.get('/progress/:id', slowedReverbController.getProgress)

export const slowedReverbRouter = router 