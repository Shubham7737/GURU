"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, GraduationCap, ChevronRight, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link href="/" className="logo">
        <div className="logo-icon-box">
          <GraduationCap className="logo-icon-img" />
        </div>
        <span className="logo-text">Guru<span className="logo-highlight">Edu</span></span>
      </Link>

        <div className="nav-links desktop-only">
        <a href="#courses" className="nav-link">Courses</a>
        <a href="#live-sessions" className="nav-link">Live Classes</a>
        <a href="#features" className="nav-link">About</a>
        <Link href="/" className="nav-link">Home</Link>
      </div>

        <div className="nav-actions desktop-only">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="btn-text">Login</Link>
              <Link href="/signup" className="btn btn-primary">
                Get Started <ChevronRight size={18} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>

        <button 
          className="mobile-menu-btn mobile-only"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-links">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <a href="#courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</a>
          <a href="#live-sessions" onClick={() => setIsMobileMenuOpen(false)}>Live Classes</a>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
          <div className="mobile-actions">
            {!isLoggedIn ? (
              <>
                <Link href="/login" className="btn btn-outline" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link href="/signup" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Signup</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="btn btn-outline">Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
