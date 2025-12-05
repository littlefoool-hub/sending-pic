import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ImageUploader from './components/ImageUploader';
import ResultPage from './components/ResultPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ImageUploader />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

