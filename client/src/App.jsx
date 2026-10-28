import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import UserHome from './UserHome.jsx';
import AdminHome from './AdminHome.jsx';
import AuthPage from './AuthPage.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';

function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();
  return <header className="site-nav"><div className="container nav-inner"><Link className="brand" to="/" aria-label="HotelPro home"><span className="brand-mark">H</span><span>HOTELPRO</span></Link><nav className="nav-links"><Link to="/#stays">THE STAYS</Link><Link to="/#my-bookings">MY BOOKINGS</Link>{user ? <><span className="nav-greeting">{user.name.split(' ')[0]}</span><button className="nav-auth-button" onClick={logout}>SIGN OUT</button></> : <><Link className="nav-signin" to="/login">SIGN IN</Link><Link className="nav-register" to="/register">JOIN</Link></>}<Link className="nav-admin" to={location.pathname === '/admin' ? '/' : '/admin'}>{location.pathname === '/admin' ? 'GUEST VIEW' : 'MANAGE'}</Link></nav></div></header>;
}
function Footer() { return <footer className="site-footer"><div className="container footer-inner"><Link className="brand" to="/"><span className="brand-mark">H</span><span>HOTELPRO</span></Link><p>Thoughtful stays. Made simple. © {new Date().getFullYear()} HotelPro.</p><Link to="/admin" className="footer-admin">Property management</Link></div></footer>; }
function HotelApp() { return <><Navigation/><Routes><Route path="/" element={<UserHome/>}/><Route path="/admin" element={<AdminHome/>}/><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes><Footer/></>; }
export default function App() { return <AuthProvider><HotelApp/></AuthProvider>; }
