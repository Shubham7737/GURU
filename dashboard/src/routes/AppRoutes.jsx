import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Memberships from '../pages/Memberships';
import Classes from '../pages/Classes';
import Subjects from '../pages/Subjects';
import Courses from '../pages/Courses';
import CourseCreate from '../pages/CourseCreate';
import AdminProfile from '../pages/AdminProfile';
import Clients from '../pages/Clients';
import ForgotPassword from '../pages/ForgotPassword';
import MainLayout from '../layout/MainLayout';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/memberships"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Memberships />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Classes />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Subjects />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Courses />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Clients />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/create"
          element={
            <ProtectedRoute>
              <CourseCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/edit/:id"
          element={
            <ProtectedRoute>
              <CourseCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;