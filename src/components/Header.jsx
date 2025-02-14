import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaYoutube, 
  FaHeadphones, 
  FaMoon, 
  FaSun, 
  FaBars, 
  FaTimes,
  FaDownload,
  FaClock
} from 'react-icons/fa'

const Header = ({ toggleTheme, isDark }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-red-600 to-purple-600 rounded-full opacity-75 blur-sm"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <FaYoutube className="text-3xl text-red-600 relative z-10" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 text-transparent bg-clip-text">
                YT Downloader
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4">
              <NavLink to="/" active={location.pathname === '/'}>
                <FaDownload className="text-xl" />
                <span>Download</span>
              </NavLink>
              
              <NavLink to="/audio8d" active={location.pathname === '/audio8d'}>
                <FaHeadphones className="text-xl" />
                <span>Áudio 8D</span>
              </NavLink>

              <NavLink to="/slowed-reverb" active={location.pathname === '/slowed-reverb'}>
                <FaClock className="text-xl" />
                <span>Slowed + Reverb</span>
              </NavLink>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="text-xl text-gray-600 dark:text-gray-300" />
              ) : (
                <FaBars className="text-xl text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white dark:bg-gray-900 rounded-b-2xl shadow-lg"
            >
              <div className="p-4 space-y-4">
                <MobileNavLink to="/" active={location.pathname === '/'}>
                  <FaDownload className="text-xl" />
                  <span>Download</span>
                </MobileNavLink>
                
                <MobileNavLink to="/audio8d" active={location.pathname === '/audio8d'}>
                  <FaHeadphones className="text-xl" />
                  <span>Áudio 8D</span>
                </MobileNavLink>

                <MobileNavLink to="/slowed-reverb" active={location.pathname === '/slowed-reverb'}>
                  <FaClock className="text-xl" />
                  <span>Slowed + Reverb</span>
                </MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

// Theme Toggle Component
const ThemeToggle = ({ isDark, toggleTheme }) => (
  <motion.button
    whileHover={{ scale: 1.1, rotate: 180 }}
    whileTap={{ scale: 0.95 }}
    onClick={toggleTheme}
    className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    aria-label="Toggle theme"
  >
    <motion.div
      initial={false}
      animate={{ rotate: isDark ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {isDark ? (
        <FaSun className="text-xl text-yellow-500" />
      ) : (
        <FaMoon className="text-xl text-gray-600" />
      )}
    </motion.div>
  </motion.button>
)

// Desktop NavLink Component
const NavLink = ({ to, children, active }) => (
  <Link to={to}>
    <motion.div
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
        active 
          ? 'text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600 rounded-full -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.div>
  </Link>
)

// Mobile NavLink Component
const MobileNavLink = ({ to, children, active }) => (
  <Link to={to}>
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        active
          ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  </Link>
)

export default Header 