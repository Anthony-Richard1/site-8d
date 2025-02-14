import { audio8dService } from '../services/audio8d.service.js'

export const audio8dController = {
  async convert(req, res) {
    try {
      const { url } = req.body
      const audioFile = req.file

      if (!url && !audioFile) {
        return res.status(400).json({ error: 'URL ou arquivo de áudio é obrigatório' })
      }

      const conversionId = Date.now().toString()
      
      // Inicia a conversão de forma assíncrona
      audio8dService.startConversion(url || audioFile.path, conversionId, !!url)
        .catch(error => {
          console.error('Erro na conversão:', error)
        })
      
      res.json({ 
        message: 'Conversão iniciada',
        conversionId
      })
    } catch (error) {
      console.error('Erro ao iniciar conversão:', error)
      res.status(500).json({ error: 'Erro ao iniciar conversão' })
    }
  },

  async getProgress(req, res) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ error: 'ID não fornecido' })
      }
      
      const progress = audio8dService.getProgress(id)
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