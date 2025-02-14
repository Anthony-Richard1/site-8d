import { Router } from 'express'
import { downloadController } from '../controllers/download.controller.js'

const router = Router()

router.post('/download', downloadController.download)
router.get('/info', downloadController.getVideoInfo)
router.get('/progress/:id', downloadController.getProgress)

export { router as downloadRouter } 