import { Link, Navigate, Route, Routes } from 'react-router-dom';
import UserHome from './UserHome.jsx';
import AdminHome from './AdminHome.jsx';
export default function App() { return <><nav className="navbar navbar-expand bg-white shadow-sm px-4"><Link className="navbar-brand fw-bold text-primary" to="/">HotelPro</Link><div className="navbar-nav ms-auto"><Link className="nav-link" to="/">Stay</Link><Link className="nav-link" to="/admin">Management</Link></div></nav><Routes><Route path="/" element={<UserHome/>}/><Route path="/admin" element={<AdminHome/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></>; }
