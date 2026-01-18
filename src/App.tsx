import { Router, Route } from './Router';
import { AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { AdminPanel } from './pages/AdminPanel';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/">
          <HomePage />
        </Route>
        <Route path="/auth">
          <AuthPage />
        </Route>
        <Route path="/admin">
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        </Route>
      </Router>
    </AuthProvider>
  );
}
