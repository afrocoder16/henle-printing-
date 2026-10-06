import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { trackPageView } from './analytics'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import PressRun from './pages/PressRun'
import ServicePage from './components/service/ServicePage'
import { servicePages, serviceOrder } from './serviceData'
import About from './pages/About'
import Quote from './pages/Quote'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import ArtworkHelp from './pages/tools/ArtworkHelp'
import Estimator from './pages/tools/Estimator'
import EddmPlanner from './pages/tools/EddmPlanner'

export default function App() {
  const location = useLocation()
  useEffect(() => { trackPageView(location.pathname + location.search) }, [location.pathname, location.search])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio-b" element={<PressRun />} />
          {serviceOrder.map((slug) => (
            <Route key={slug} path={servicePages[slug].path} element={<ServicePage slug={slug} />} />
          ))}
          <Route path="/tools" element={<Navigate to="/estimator" replace />} />
          <Route path="/artwork-help" element={<ArtworkHelp />} />
          <Route path="/paper-guide" element={<Navigate to="/estimator?step=paper" replace />} />
          <Route path="/deadline-planner" element={<Navigate to="/estimator" replace />} />
          <Route path="/estimator" element={<Estimator />} />
          <Route path="/eddm-planner" element={<EddmPlanner />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
