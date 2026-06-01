import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import CourseLearning from './pages/CourseLearning';
import LiveClass from './pages/LiveClass';
import CourseDetails from './pages/CourseDetails';
import Payment from './pages/Payment';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><LandingPage /><Footer /></>} />
          <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
          <Route path="/signup" element={<><Navbar /><Signup /><Footer /></>} />
          <Route path="/course/:id" element={<><Navbar /><CourseDetails /><Footer /></>} />
          <Route path="/payment" element={<><Navbar /><Payment /><Footer /></>} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/learn/:courseId" element={<><Navbar /><CourseLearning /><Footer /></>} />
          <Route path="/live-session/:id" element={<><Navbar /><LiveClass /><Footer /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
