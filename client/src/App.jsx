import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Profile from './components/Profile';
import Login from './pages/Login';
import ChatRoom from './pages/ChatRoom';
import Rooms from './pages/Rooms';
import { useUserSync } from './hooks/useUserSync';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen text-amber-50 text-xl">Loading...</div>;
  
  return isAuthenticated ? children : <Navigate to="/" />;
}

export default function App() {
  // Sync user to local database after Auth0 login
  useUserSync();
  const { isAuthenticated, isLoading } = useAuth0();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" 
          element={
            isLoading ? (
              <div className="flex items-center justify-center min-h-screen text-amber-50 text-xl">Loading...</div>
            ) : isAuthenticated ? (
              <Navigate to="/rooms" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rooms" 
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatroom/:roomId" 
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}