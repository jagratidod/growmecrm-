import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

// Pages
import HomePage from '../pages/Home/HomePage';
import ServicesPage from '../pages/Services/ServicesPage';
import ContactPage from '../pages/Contact/ContactPage';
import PrivacyPolicyPage from '../pages/Legal/PrivacyPolicyPage';
import TermsPage from '../pages/Legal/TermsPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        
        {/* Services */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<Navigate to="/services" replace />} />
        
        {/* Industries */}
        <Route path="/industries" element={<Navigate to="/services" replace />} />
        <Route path="/industries/:slug" element={<Navigate to="/services" replace />} />
        
        {/* Portfolio */}
        <Route path="/portfolio" element={<Navigate to="/services" replace />} />
        <Route path="/portfolio/:slug" element={<Navigate to="/services" replace />} />
        
        {/* Other Pages */}
        <Route path="/process" element={<Navigate to="/#getting-started" replace />} />
        <Route path="/careers" element={<Navigate to="/contact" replace />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/get-a-quote" element={<Navigate to="/contact" replace />} />
        
        {/* Legal */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
