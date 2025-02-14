import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUpload, 
  FaYoutube, 
  FaPlay, 
  FaStop, 
  FaSpinner,
  FaVolumeUp,
  FaMusic,
  FaInfoCircle,
  FaClock
} from 'react-icons/fa'
import axios from 'axios'
import { slowedReverbService } from '../services/slowed-reverb.service'

const API_URL = 'http://localhost:3000/api'

const SlowedReverbSection = () => {
  // Estados
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('youtube')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [playbackRate, setPlaybackRate] = useState(0.85)
  const [reverbAmount, setReverbAmount] = useState(0.5)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [conversionId, setConversionId] = useState(null)
  const progressInterval = useRef(null)

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      slowedReverbService.stop()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Manipuladores de eventos
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Por favor, selecione um arquivo de áudio válido')
    }
  }

  const checkProgress = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/slowed-reverb/progress/${id}`)
      const { status, progress: convProgress, downloadUrl } = response.data
      
      if (status === 'completed' && downloadUrl) {
        setDownloadUrl(downloadUrl)
        setProgress(100)
        setLoading(false)
        clearInterval(progressInterval.current)
        
        try {
          const audioUrl = `${API_URL.replace('/api', '')}${downloadUrl}`
          console.log('🎵 Carregando áudio:', audioUrl)
          
          const success = await slowedReverbService.process(audioUrl, {
            volume,
            playbackRate,
            reverbAmount
          })

          if (success) {
            setIsPlaying(true)
            setError(null)
          } else {
            throw new Error('Erro ao processar áudio')
          }
        } catch (error) {
          console.error('Erro ao processar áudio:', error)
          setError('Erro ao processar áudio. Tente novamente.')
          setIsPlaying(false)
        }
      } else if (status === 'error') {
        throw new Error('Erro na conversão')
      } else {
        setProgress(convProgress || 0)
      }
    } catch (error) {
      console.error('Erro:', error)
      setError('Erro ao processar áudio')
      setLoading(false)
      clearInterval(progressInterval.current)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDownloadUrl(null)

    try {
      let response
      
      if (mode === 'youtube') {
        response = await axios.post(`${API_URL}/slowed-reverb/convert`, { url })
      } else {
        const formData = new FormData()
        formData.append('audio', file)
        response = await axios.post(`${API_URL}/slowed-reverb/convert`, formData)
      }

      const { conversionId } = response.data
      setConversionId(conversionId)

      progressInterval.current = setInterval(() => {
        checkProgress(conversionId)
      }, 1000)
    } catch (error) {
      console.error('Erro:', error)
      setError('Erro ao iniciar conversão')
      setLoading(false)
    }
  }

  const drawVisualizer = () => {
    if (!canvasRef.current || !isPlaying) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dataArray = slowedReverbService.getAnalyserData()
    
    if (!dataArray) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const barWidth = (canvas.width / dataArray.length) * 2.5
    let barHeight
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height

      const hue = (i / dataArray.length) * 360
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      x += barWidth + 1
    }

    animationRef.current = requestAnimationFrame(drawVisualizer)
  }

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 dark:to-dark-light opacity-50" />
        
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Title */}
            <motion.div 
              className="hero-title relative inline-block"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="block text-4xl sm:text-5xl md:text-7xl font-bold mb-2">
                Transforme sua música em
              </span>
              <span className="block text-4xl sm:text-5xl md:text-7xl font-bold mb-2 gradient-text">
                Slowed + Reverb
              </span>
            </motion.div>

            <motion.p 
              className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FaClock className="text-primary animate-pulse" />
              Experimente o som relaxante e atmosférico
              <FaMusic className="text-primary animate-bounce" />
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Converter Section */}
      <section className="py-12 px-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-effect p-8 rounded-2xl shadow-lg">
              {/* Mode Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setMode('youtube')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                    mode === 'youtube'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaYoutube className="text-xl" />
                  YouTube
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                    mode === 'upload'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaUpload className="text-xl" />
                  Upload
                </button>
              </div>

              {/* Input Section */}
              <AnimatePresence mode="wait">
                {mode === 'youtube' ? (
                  <motion.div
                    key="youtube"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Cole o link do YouTube aqui"
                        className="input-field pr-12"
                      />
                      <FaYoutube className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <label className="block w-full p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="audio/*"
                        className="hidden"
                      />
                      <div className="text-center space-y-2">
                        <FaUpload className="mx-auto text-3xl text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-300">
                          Arraste seu arquivo ou clique para selecionar
                        </p>
                        <p className="text-sm text-gray-500">
                          Suporta arquivos de áudio (MP3, WAV, etc)
                        </p>
                      </div>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg flex items-center gap-2"
                  >
                    <FaInfoCircle />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Convert Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || (!url && !file)}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FaClock />
                    Converter para Slowed + Reverb
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {progress !== null && (
                <div className="mt-6">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {progress}% concluído
                  </p>
                </div>
              )}
            </div>

            {/* Player Section */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 glass-effect p-8 rounded-2xl shadow-lg"
                >
                  <div className="space-y-6">
                    <canvas
                      ref={canvasRef}
                      width="640"
                      height="100"
                      className="w-full h-24 bg-gray-900 rounded-lg"
                    />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Volume: {Math.round(volume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setVolume(value)
                            slowedReverbService.setVolume(value)
                          }}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Velocidade: {Math.round(playbackRate * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="1"
                          step="0.05"
                          value={playbackRate}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setPlaybackRate(value)
                            slowedReverbService.setPlaybackRate(value)
                          }}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Reverb: {Math.round(reverbAmount * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={reverbAmount}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            setReverbAmount(value)
                            slowedReverbService.setReverbAmount(value)
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        slowedReverbService.stop()
                        setIsPlaying(false)
                      }}
                      className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaStop />
                      Parar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default SlowedReverbSection 