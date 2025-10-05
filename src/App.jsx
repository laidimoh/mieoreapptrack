import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'
import { TimeTrackingProvider } from './contexts/TimeTrackingContext.jsx'
import LoadingSpinner from './components/ui/LoadingSpinner.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CalendarReportsPage from './pages/CalendarReportsPage.jsx'
import DailyInputPage from './pages/DailyInputPage.jsx'
import MonthlyOverviewPage from './pages/MonthlyOverviewPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingSpinner />
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <CalendarReportsPage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/daily-input" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <DailyInputPage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/monthly-overview" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <MonthlyOverviewPage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={<Navigate to="/calendar" replace />}
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-insights" 
        element={<Navigate to="/analytics" replace />}
      />
      <Route 
        path="/salary-estimator" 
        element={<Navigate to="/analytics" replace />}
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route - redirect to dashboard if authenticated, otherwise to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <TimeTrackingProvider>
            <div className="min-h-screen bg-background">
              <AppRoutes />
            </div>
          </TimeTrackingProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
