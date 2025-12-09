import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import NotificationContainer from './components/Notification';
import Login from './components/Login';
import Register from './components/Register';
import ImageUploader from './components/ImageUploader';
import Unauthorized from './components/Unauthorized';
import { AdminUsers, UserImages } from './components/Admin';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/upload"
            element={
              <ProtectedRoute requireUser>
                <Header />
                <ImageUploader />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <Header />
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users/:id/images"
            element={
              <ProtectedRoute requireAdmin>
                <Header />
                <UserImages />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NotificationContainer />
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;

