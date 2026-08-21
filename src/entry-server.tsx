import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import PriceEstimatorPage from './pages/PriceEstimatorPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './index.css'

// Minimal SSR App - no browser APIs, no DB calls
function SSRApp({ url }: { url: string }) {
  const isEstimatePage = url === '/priceestimator'
  return (
    <div className="site">
      {!isEstimatePage && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/priceestimator" element={<PriceEstimatorPage />} />
      </Routes>
      {!isEstimatePage && <Footer />}
    </div>
  )
}

export function render(url: string) {
  const helmetContext: Record<string, unknown> = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <SSRApp url={url} />
      </StaticRouter>
    </HelmetProvider>
  )
  return { html, helmet: helmetContext.helmet }
}
