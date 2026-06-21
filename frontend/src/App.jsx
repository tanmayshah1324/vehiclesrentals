import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminCategories from './pages/admin/AdminCategories';
import AdminHubs from './pages/admin/AdminHubs';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import UserBookingsPage from './pages/UserBookingsPage';
import ProfilePage from './pages/ProfilePage';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    return <>{children}</>;
};
function App() {
    return (<AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />}/>
              <Route path="vehicles" element={<VehiclesPage />}/>
              <Route path="cars" element={<VehiclesPage />}/>
              <Route path="bikes" element={<VehiclesPage />}/>
              <Route path="about" element={<AboutPage />}/>
              <Route path="contact" element={<ContactPage />}/>
              <Route path="vehicles/:id" element={<VehicleDetailPage />}/>
              <Route path="booking/:id" element={<ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>}/>
              <Route path="bookings" element={<ProtectedRoute>
                    <UserBookingsPage />
                  </ProtectedRoute>}/>
              <Route path="profile" element={<ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>}/>
            </Route>
            
            <Route path="/login" element={<LoginPage />}/>
            <Route path="/signup" element={<SignupPage />}/>
            
            <Route path="/admin" element={<ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>}>
              <Route index element={<AdminDashboard />}/>
              <Route path="vehicles" element={<AdminVehicles />}/>
              <Route path="categories" element={<AdminCategories />}/>
              <Route path="hubs" element={<AdminHubs />}/>
              <Route path="bookings" element={<AdminBookings />}/>
              <Route path="users" element={<AdminUsers />}/>
              <Route path="settings" element={<AdminSettings />}/>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>);
}
export default App;
