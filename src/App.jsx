import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import DownloadSection from './components/DownloadSection'
import Audio8DSection from './components/Audio8DSection'
import SlowedReverbSection from './components/SlowedReverbSection'
import PageTransition from './components/PageTransition'

function AppContent() {
  const location = useLocation()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <Header toggleTheme={toggleTheme} isDark={isDark} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <PageTransition>
                <Hero />
                <DownloadSection />
              </PageTransition>
            } 
          />
          <Route 
            path="/audio8d" 
            element={
              <PageTransition>
                <Audio8DSection />
              </PageTransition>
            } 
          />
          <Route 
            path="/slowed-reverb" 
            element={
              <PageTransition>
                <SlowedReverbSection />
              </PageTransition>
            } 
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
