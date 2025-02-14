class Audio8DProcessor {
  constructor() {
    this.audioContext = null
    this.source = null
    this.panner = null
    this.gainNode = null
    this.analyser = null
    this.listener = null
    this.isPlaying = false
    this.audioBuffer = null
    this.movementSpeed = 0.01
    this.angle = 0
    this.animationFrame = null
  }

  async initialize() {
    if (this.audioContext) {
      await this.audioContext.resume()
      return
    }

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Configuração do listener (ouvinte)
    this.listener = this.audioContext.listener
    this.listener.setPosition(0, 0, 0)
    
    // Verificar qual método está disponível para orientação
    if (this.listener.setOrientation) {
      this.listener.setOrientation(0, 0, -1, 0, 1, 0)
    } else if (this.listener.forwardX) {
      // Configuração alternativa para navegadores mais novos
      this.listener.forwardX.value = 0
      this.listener.forwardY.value = 0
      this.listener.forwardZ.value = -1
      this.listener.upX.value = 0
      this.listener.upY.value = 1
      this.listener.upZ.value = 0
    }

    // Configuração do panner 3D
    this.panner = this.audioContext.createPanner()
    this.panner.panningModel = 'HRTF'
    this.panner.distanceModel = 'linear'
    this.panner.refDistance = 1
    this.panner.maxDistance = 10000
    this.panner.rolloffFactor = 1
    this.panner.setPosition(2, 0, 0)
    
    // Ganho para controle de volume
    this.gainNode = this.audioContext.createGain()
    this.gainNode.gain.value = 0.8
    
    // Analisador para visualização
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 2048
    
    // Conectando os nós
    this.panner.connect(this.gainNode)
    this.gainNode.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)
  }

  async loadAudioFromUrl(url) {
    try {
      console.log('📥 Carregando áudio:', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar áudio: ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      console.log('✅ Áudio carregado com sucesso')
      
      return true
    } catch (error) {
      console.error('❌ Erro ao carregar áudio:', error)
      throw error
    }
  }

  async start() {
    if (this.isPlaying) this.stop()
    if (!this.audioBuffer) return false

    try {
      this.source = this.audioContext.createBufferSource()
      this.source.buffer = this.audioBuffer
      this.source.connect(this.panner)
      
      // Configuração inicial do volume com fade in
      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      this.gainNode.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 1)
      
      this.source.start(0)
      this.isPlaying = true
      this.startMovement()
      
      return true
    } catch (error) {
      console.error('Erro ao iniciar reprodução:', error)
      return false
    }
  }

  startMovement() {
    const animate = () => {
      if (!this.isPlaying) return

      this.angle += this.movementSpeed
      const radius = 5
      const x = Math.sin(this.angle) * radius
      const z = Math.cos(this.angle) * radius
      
      // Movimento suave em 3D
      this.panner.setPosition(x, 0, z)

      this.animationFrame = requestAnimationFrame(animate)
    }

    this.animationFrame = requestAnimationFrame(animate)
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop()
        this.source.disconnect()
        cancelAnimationFrame(this.animationFrame)
        this.angle = 0
      } catch (error) {
        console.error('Erro ao parar áudio:', error)
      }
    }
    this.isPlaying = false
  }

  setVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.linearRampToValueAtTime(
        value,
        this.audioContext.currentTime + 0.1
      )
    }
  }

  setPanningSpeed(value) {
    this.movementSpeed = value * 0.01
  }

  getAnalyserData() {
    if (!this.analyser) return null
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(dataArray)
    return dataArray
  }

  async process(input, options = {}) {
    try {
      await this.initialize()
      
      if (input instanceof File) {
        const arrayBuffer = await input.arrayBuffer()
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      } else if (typeof input === 'string') {
        await this.loadAudioFromUrl(input)
      }

      if (options.volume) this.setVolume(options.volume)
      if (options.panningSpeed) this.setPanningSpeed(options.panningSpeed)

      return this.start()
    } catch (error) {
      console.error('Erro ao processar áudio:', error)
      return false
    }
  }
}

export const audio8dService = new Audio8DProcessor() 