import { downloadService } from '../services/download.service.js'

export const downloadController = {
  async download(req, res) {
    try {
      const { url, format, quality } = req.body
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL inválida' })
      }

      const downloadId = Date.now().toString()
      
      // Inicia o download de forma assíncrona
      downloadService.startDownload(url, format, quality, downloadId)
        .catch(error => {
          console.error('Erro no download:', error)
        })
      
      res.json({ 
        message: 'Download iniciado',
        downloadId,
      })
    } catch (error) {
      console.error('Erro no download:', error)
      res.status(500).json({ error: 'Erro ao iniciar download' })
    }
  },

  async getVideoInfo(req, res) {
    try {
      const { url } = req.query
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL inválida' })
      }

      const info = await downloadService.getVideoInfo(url)
      res.json(info)
    } catch (error) {
      console.error('Erro ao obter informações:', error)
      res.status(500).json({ error: 'Erro ao obter informações do vídeo' })
    }
  },

  async getProgress(req, res) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: 'ID não fornecido' })
      }
      
      const progress = downloadService.getProgress(id)
      if (!progress) {
        return res.status(404).json({ status: 'not_found' })
      }
      
      res.json(progress)
    } catch (error) {
      console.error('Erro ao obter progresso:', error)
      res.status(500).json({ error: 'Erro ao obter progresso' })
    }
  }
} 