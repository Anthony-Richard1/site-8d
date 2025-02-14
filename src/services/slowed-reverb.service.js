class SlowedReverbProcessor {
  constructor() {
    this.audioContext = null
    this.source = null
    this.convolver = null
    this.gainNode = null
    this.analyser = null
    this.isPlaying = false
    this.audioBuffer = null
    this.playbackRate = 0.85 // Taxa de reprodução padrão (85% da velocidade original)
    this.reverbAmount = 0.5 // Quantidade de reverb padrão
  }

  async initialize() {
    if (this.audioContext) {
      await this.audioContext.resume()
      return
    }

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Configuração do ganho
    this.gainNode = this.audioContext.createGain()
    this.gainNode.gain.value = 0.8

    // Configuração do reverb
    this.convolver = this.audioContext.createConvolver()
    await this.setupReverb()

    // Analisador para visualização
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 2048

    // Conectando os nós
    this.convolver.connect(this.gainNode)
    this.gainNode.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)
  }

  async setupReverb() {
    // Criar reverb sintético
    const duration = 3
    const decay = 2
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const impulse = this.audioContext.createBuffer(2, length, sampleRate)
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate
        channelData[i] = ((Math.random() * 2) - 1) * 
                        Math.pow(1 - t / duration, decay)
      }
    }
    
    this.convolver.buffer = impulse
  }

  async loadAudio(input) {
    try {
      if (input instanceof File) {
        const arrayBuffer = await input.arrayBuffer()
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      } else if (typeof input === 'string') {
        const response = await fetch(input)
        const arrayBuffer = await response.arrayBuffer()
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      }
      return true
    } catch (error) {
      console.error('Erro ao carregar áudio:', error)
      return false
    }
  }

  start() {
    if (this.isPlaying) this.stop()
    if (!this.audioBuffer) return false

    try {
      this.source = this.audioContext.createBufferSource()
      this.source.buffer = this.audioBuffer
      this.source.playbackRate.value = this.playbackRate
      
      this.source.connect(this.convolver)
      
      this.source.start(0)
      this.isPlaying = true
      
      return true
    } catch (error) {
      console.error('Erro ao iniciar reprodução:', error)
      return false
    }
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop()
        this.source.disconnect()
      } catch (error) {
        console.error('Erro ao parar áudio:', error)
      }
    }
    this.isPlaying = false
  }

  setVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = value
    }
  }

  setPlaybackRate(value) {
    this.playbackRate = value
    if (this.source) {
      this.source.playbackRate.value = value
    }
  }

  setReverbAmount(value) {
    this.reverbAmount = value
    if (this.convolver) {
      this.gainNode.gain.value = value
    }
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
      const success = await this.loadAudio(input)
      
      if (!success) return false

      if (options.playbackRate) this.setPlaybackRate(options.playbackRate)
      if (options.reverbAmount) this.setReverbAmount(options.reverbAmount)
      if (options.volume) this.setVolume(options.volume)

      return this.start()
    } catch (error) {
      console.error('Erro ao processar áudio:', error)
      return false
    }
  }
}

export const slowedReverbService = new SlowedReverbProcessor() 