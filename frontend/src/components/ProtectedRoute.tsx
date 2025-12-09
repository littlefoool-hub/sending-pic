import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireUser?: boolean; // Только для обычных пользователей (НЕ админов)
}

export default function ProtectedRoute({ children, requireAdmin = false, requireUser = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если требуется роль админа, но пользователь не админ - редирект на /unauthorized
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Если требуется роль пользователя (не админ), но пользователь админ - редирект на /unauthorized
  if (requireUser && isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

