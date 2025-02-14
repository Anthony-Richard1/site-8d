import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { downloadRouter } from './routes/download.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { checkDependencies } from './utils/checkDependencies.js'
import fs from 'fs'
import { audio8dRouter } from './routes/audio8d.routes.js'
import { slowedReverbRouter } from './routes/slowed-reverb.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Verifica dependências antes de iniciar o servidor
await checkDependencies()

dotenv.config()

const app = express()

// Configuração para servir arquivos temporários
const tempDir = path.join(__dirname, '../temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

// Importante: Adicionar estas configurações de CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend
  methods: ['GET', 'POST'],
  credentials: true
}))

app.use('/temp', express.static(tempDir, {
  setHeaders: (res, path) => {
    res.set('Content-Disposition', 'attachment')
  }
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rotas
app.use('/api', downloadRouter)
app.use('/api/audio8d', audio8dRouter)
app.use('/api/slowed-reverb', slowedReverbRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
}) 