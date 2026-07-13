import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ServicesPage from './pages/ServicesPage'
import EstimatePage from './pages/EstimatePage'
import PriceEstimatorPage from './pages/PriceEstimatorPage'
import SubcontractorPage from './pages/SubcontractorPage'
import AdminDashboard from './pages/AdminDashboard'
import RequireAuth from './components/RequireAuth'
import { CopyProvider } from './context/CopyProvider'
import FCDChatbot from './components/FCDChatbot'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      className={`back-to-top ${isVisible ? 'back-to-top--visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 24 24">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

import { fetchPriceOverrides } from './lib/priceOverrides'
import { applyPricingRules } from './data/pricingMapper'

export default function App() {
  const { pathname } = useLocation()
  const isEstimatePage = pathname === '/estimate' || pathname === '/priceestimator'
  const isAdmin = pathname.startsWith('/admin')

  // Load pricing overrides once on app start so all calculations use latest prices
  useEffect(() => {
    fetchPriceOverrides()
      .then(overrides => {
        if (overrides) {
          applyPricingRules(overrides)
        }
      })
      .catch(err => console.error('Failed to load pricing overrides', err))
  }, [])

  return (
    <CopyProvider>
      <div className="site">
        <ScrollToTop />
        {!isEstimatePage && !isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/estimate" element={<EstimatePage />} />
        <Route path="/priceestimator" element={<PriceEstimatorPage />} />
        <Route path="/subcontractor" element={<SubcontractorPage />} />
        <Route path="/admin/*" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
      </Routes>
      <BackToTopButton />
      {!isEstimatePage && !isAdmin && <FCDChatbot />}
      {!isEstimatePage && !isAdmin && <Footer />}
    </div>
    </CopyProvider>
  )
}
