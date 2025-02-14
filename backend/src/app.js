import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Configuração do CORS
app.use(cors())

// Configuração para servir arquivos estáticos
app.use('/temp', express.static(path.join(__dirname, '../temp')))

// ... resto das configurações do app ... 