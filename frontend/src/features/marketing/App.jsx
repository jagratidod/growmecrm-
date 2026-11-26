import './index.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <div className="growme-marketing">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}
