import { useTheme } from './hooks/useTheme.js';
import { useAuth } from './hooks/useAuth.js';
import SplashPage from './pages/SplashPage/SplashPage.jsx';
import AuthPage from './pages/AuthPage/AuthPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';

/** Top-level page switch: splash while booting, auth when signed out, home when signed in. */
export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { me, setMe, ready, logout } = useAuth();

  if (!ready) return <SplashPage />;
  if (!me) return <AuthPage onAuth={setMe} theme={theme} onToggleTheme={toggleTheme} />;
  return <HomePage me={me} onMeChange={setMe} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />;
}
