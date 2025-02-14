import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDownload, FaCog, FaYoutube, FaCog as FaSettings, FaSpinner } from 'react-icons/fa'
import { HiOutlineVideoCamera, HiOutlineMusicNote } from 'react-icons/hi'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const DownloadSection = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('MP4')
  const [selectedQuality, setSelectedQuality] = useState('1080p')
  const [showQualityOptions, setShowQualityOptions] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [error, setError] = useState(null)
  const [videoInfo, setVideoInfo] = useState(null)
  const progressInterval = useRef(null)

  const formats = [
    { id: 'MP4', icon: '🎥', type: 'video' },
    { id: 'MP3', icon: '🎵', type: 'audio' },
    { id: 'WAV', icon: '🎼', type: 'audio' },
    { id: 'M4A', icon: '🎧', type: 'audio' }
  ]

  const qualities = {
    video: [
      { label: '4K', value: '2160p', fps: '60fps' },
      { label: '2K', value: '1440p', fps: '60fps' },
      { label: 'Full HD', value: '1080p', fps: '60fps' },
      { label: 'HD', value: '720p', fps: '60fps' },
      { label: 'SD', value: '480p', fps: '30fps' },
      { label: 'Low', value: '360p', fps: '30fps' }
    ],
    audio: [
      { label: 'High', value: '320kbps' },
      { label: 'Medium', value: '256kbps' },
      { label: 'Low', value: '128kbps' }
    ]
  }

  const currentFormat = formats.find(f => f.id === selectedFormat)
  const currentQualities = qualities[currentFormat?.type || 'video']

  const getVideoInfo = async (videoUrl) => {
    try {
      const response = await axios.get(`${API_URL}/info`, {
        params: { url: videoUrl }
      })
      setVideoInfo(response.data)
      setError(null)
    } catch (error) {
      setVideoInfo(null)
      setError('Erro ao obter informações do vídeo')
      console.error('Erro:', error)
    }
  }

  const initiateDownload = (downloadUrl, filename) => {
    console.log('Iniciando download:', downloadUrl)
    const link = document.createElement('a')
    link.href = `http://localhost:3000${downloadUrl}`
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const checkProgress = async (downloadId) => {
    if (!downloadId) return

    try {
      const response = await axios.get(`${API_URL}/progress/${downloadId}`)
      const data = response.data
      console.log('📊 Status do download:', data)

      if (data.status === 'not_found') {
        setLoading(false)
        setError('Download não encontrado')
        clearInterval(progressInterval.current)
        return
      }

      setDownloadProgress(data)

      if (data.status === 'completed' && data.downloadUrl) {
        console.log('✅ Download completo, iniciando download do arquivo')
        setLoading(false)
        initiateDownload(data.downloadUrl, data.file)
        clearInterval(progressInterval.current)
      } else if (data.status === 'error') {
        console.error('❌ Erro:', data.error)
        setLoading(false)
        setError(data.error || 'Erro durante o download')
        clearInterval(progressInterval.current)
      }
    } catch (error) {
      console.error('❌ Erro ao verificar progresso:', error)
      setLoading(false)
      setError('Erro ao verificar progresso do download')
      clearInterval(progressInterval.current)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDownloadProgress(null)

    try {
      const response = await axios.post(`${API_URL}/download`, {
        url,
        format: selectedFormat,
        quality: selectedQuality
      })

      const { downloadId } = response.data
      console.log('Download iniciado, ID:', downloadId)
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }

      progressInterval.current = setInterval(() => {
        checkProgress(downloadId)
      }, 1000)
    } catch (error) {
      console.error('Erro:', error)
      setLoading(false)
      setError('Erro ao iniciar download')
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (url) {
        getVideoInfo(url)
      } else {
        setVideoInfo(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [url])

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  return (
    <motion.section 
      className="py-20 px-4 relative min-h-[600px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 dark:to-dark-light opacity-50" />
      
      <div className="container relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="glass-effect p-8 rounded-2xl shadow-lg">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {videoInfo && (
              <div className="mb-6 flex items-center gap-4">
                <img 
                  src={videoInfo.thumbnail} 
                  alt={videoInfo.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-lg">{videoInfo.title}</h3>
                  <p className="text-sm text-gray-500">
                    Duração: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <FaYoutube className="text-2xl text-primary" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Cole o link do YouTube aqui..."
                  className="input-field pl-12"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Formato</h3>
                  <button
                    type="button"
                    onClick={() => setShowQualityOptions(!showQualityOptions)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    <FaSettings className={`transition-transform duration-300 ${showQualityOptions ? 'rotate-180' : ''}`} />
                    Qualidade
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formats.map(({ id, icon, type }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedFormat(id)
                        setSelectedQuality(qualities[type][0].value)
                      }}
                      className={`p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2
                        ${selectedFormat === id 
                          ? 'bg-primary/10 dark:bg-primary/20 border-primary' 
                          : 'bg-white/5 dark:bg-dark-light border-gray-200 dark:border-gray-700 hover:bg-white/10'
                        } border-2`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="font-medium">{id}</span>
                    </button>
                  ))}
                </div>

                {showQualityOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      {currentFormat?.type === 'video' ? (
                        <>
                          <HiOutlineVideoCamera className="text-primary" />
                          Qualidade do Vídeo
                        </>
                      ) : (
                        <>
                          <HiOutlineMusicNote className="text-primary" />
                          Qualidade do Áudio
                        </>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {currentQualities.map(({ label, value, fps }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedQuality(value)}
                          className={`p-3 rounded-lg transition-all duration-200 text-sm
                            ${selectedQuality === value
                              ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary'
                              : 'bg-white/5 dark:bg-dark-light border-gray-200 dark:border-gray-700 hover:bg-white/10'
                            } border flex flex-col items-center gap-1`}
                        >
                          <span className="font-medium">{label}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {fps ? `${value} ${fps}` : value}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !url}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaCog className="animate-spin" />
                    {downloadProgress?.status === 'downloading' 
                      ? `Baixando... ${Math.round(downloadProgress.progress || 0)}%`
                      : 'Processando...'}
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Baixar {selectedFormat} ({selectedQuality})
                  </>
                )}
              </button>

              {downloadProgress?.status === 'downloading' && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${downloadProgress.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {Math.round(downloadProgress.progress || 0)}% concluído
                  </p>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default DownloadSection 