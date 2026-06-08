"use client";

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link href="/" className="logo">
            <div className="logo-icon-box">
              <GraduationCap className="logo-icon-img" />
            </div>
            <span className="logo-text" style={{ color: 'white' }}>Guru<span className="logo-highlight">Edu</span></span>
          </Link>
          <p className="footer-desc">
            Join the future of education. We provide industry-standard mentorship 
            to help you bridge the gap between learning and career success.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><Facebook size={18} /></a>
            <a href="#" className="social-icon"><Twitter size={18} /></a>
            <a href="#" className="social-icon"><Instagram size={18} /></a>
            <a href="#" className="social-icon"><Linkedin size={18} /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li><Link href="/courses">Explore Courses</Link></li>
            <li><Link href="/live-classes">Live Sessions</Link></li>
            <li><Link href="/membership">Membership Plans</Link></li>
            <li><Link href="/teachers">Expert Mentors</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Help Center</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms & Service</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Get the latest course updates and career tips in your inbox.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email Address" required />
            <button type="submit" className="btn btn-primary btn-sm">Join</button>
          </form>
          <div className="trust-badges">
             <span><Mail size={12} /> 10k+ Learners Subscribed</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} GuruEdu Learning Pvt. Ltd. All rights reserved.</p>
          <div className="bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;