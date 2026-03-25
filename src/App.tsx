import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SignupProvider } from "./contexts/SignupContext";
import { MessagingProvider } from "./contexts/MessagingContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import RoleBasedRoute from "./Components/RoleBasedRoute";
import NavBar from "./Components/NavBar";
import PreLoader from "./Components/PreLoader";
import LandingPage from "./Landing Page/LandingPage";
import BrowsePage from "./Pages/BrowsePlace";
import SelectRole from "./Main Login Screens/SelectRole";
import HaveAccount from "./Main Login Screens/HaveAccount";
import WelcomeBackPage from "./Service Provider/Login/WelcomeBackPage";
import GetStartedPage from "./Service Provider/SignUp/GetStartedPage";
import SetupYourAccountPage from "./Service Provider/SignUp/SetupYourAccountPage";
import SetupYourLocationPage from "./Service Provider/SignUp/SetupYourLocationPage";
import VerifyYourIdPage from "./Service Provider/SignUp/VerifyYourIdPage";
import SetupYourImagePage from "./Service Provider/SignUp/SetupYourImagePage";
import SignupCompletePage from "./Service Provider/SignUp/SignupCompletePage";
import TestPage from "./test/TestPage";
import FunctionalityTest from "./test/FunctionalityTest";
import Profile from "./Service Provider/Profile";
import EditProfile from "./Service Provider/EditProfile";
import AddPost from "./Service Provider/PostAdd";
import PublicProfile from "./Service Provider/PublicProfile";
import AdminDashboard from "./Admin/AdminDashboard";
import FAQ from "./Pages/FAQ";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import Footer from "./Components/Footer";

// Placeholder components for protected routes
const SeekerDashboard = () => {
  return <Navigate to="/" replace />;
};
const ServiceProviderDashboard = () => <div>Service Provider Dashboard</div>;

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showPreloader) {
    return <PreLoader />;
  }

  return (
    <AuthProvider>
      <MessagingProvider>
        <SignupProvider>
          <div className="App min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">
              <Routes>

            {/* ── Public routes ─────────────────────────────────────────────── */}

            <Route path="/" element={
              <ProtectedRoute requireAuth={false}>
                <LandingPage />
              </ProtectedRoute>
            } />

            <Route path="/browseplace" element={
              <ProtectedRoute requireAuth={false}>
                <BrowsePage />
              </ProtectedRoute>
            } />

            <Route path="/selectrole" element={
              <ProtectedRoute requireAuth={false}>
                <SelectRole />
              </ProtectedRoute>
            } />

            <Route path="/haveaccount" element={
              <ProtectedRoute requireAuth={false}>
                <HaveAccount />
              </ProtectedRoute>
            } />

            <Route path="/welcomeback" element={
              <ProtectedRoute requireAuth={false}>
                <WelcomeBackPage />
              </ProtectedRoute>
            } />

            <Route path="/getstarted" element={
              <ProtectedRoute requireAuth={false}>
                <GetStartedPage />
              </ProtectedRoute>
            } />

            {/* ── Signup flow ───────────────────────────────────────────────── */}

            <Route path="/signup/get-started" element={
              <ProtectedRoute requireAuth={false}>
                <GetStartedPage />
              </ProtectedRoute>
            } />

            <Route path="/signup/setup-account" element={
              <ProtectedRoute requireAuth={false}>
                <SetupYourAccountPage />
              </ProtectedRoute>
            } />

            <Route path="/signup/setup-location" element={
              <ProtectedRoute requireAuth={false}>
                <SetupYourLocationPage />
              </ProtectedRoute>
            } />

            <Route path="/signup/verify-id" element={
              <ProtectedRoute requireAuth={false}>
                <VerifyYourIdPage />
              </ProtectedRoute>
            } />

            <Route path="/signup/setup-image" element={
              <ProtectedRoute requireAuth={false}>
                <SetupYourImagePage />
              </ProtectedRoute>
            } />

            <Route path="/signup/complete" element={
              <ProtectedRoute requireAuth={false}>
                <SignupCompletePage />
              </ProtectedRoute>
            } />

            {/* ── Test routes ───────────────────────────────────────────────── */}

            <Route path="/test" element={
              <ProtectedRoute requireAuth={false}>
                <TestPage />
              </ProtectedRoute>
            } />

            <Route path="/test/functionality" element={
              <ProtectedRoute>
                <FunctionalityTest />
              </ProtectedRoute>
            } />

            {/* ── Role-based protected routes ───────────────────────────────── */}

            <Route path="/seeker/*" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['seeker', 'admin']}>
                  <SeekerDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            <Route path="/service-provider/*" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['service_provider', 'admin']}>
                  <ServiceProviderDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            {/* ── Provider profile (own, editable) ─────────────────────────── */}

            <Route path="/profile" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['service_provider', 'admin']}>
                  <Profile />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            {/* ── Public profile (read-only, accessible to everyone) ────────── */}
            {/* Must be defined BEFORE /service-provider/* wildcard              */}

            <Route path="/public-profile/:serviceProviderId" element={
              <ProtectedRoute requireAuth={false}>
                <PublicProfile />
              </ProtectedRoute>
            } />

            {/* ── Edit Profile ──────────────────────────────────────────────── */}

            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['service_provider', 'admin']}>
                  <EditProfile />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            {/* ── Add Post (create new) ─────────────────────────────────────── */}

            <Route path="/add-post" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['service_provider']}>
                  <AddPost />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            {/* ── Edit Post (prefills form from Firestore, resubmits as pending) */}

            <Route path="/add-post/:postId" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['service_provider']}>
                  <AddPost />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            {/* ── FAQ and Privacy Policy ──────────────────────────────────────── */}

            <Route path="/faq" element={
              <ProtectedRoute requireAuth={false}>
                <FAQ />
              </ProtectedRoute>
            } />

            <Route path="/privacy-policy" element={
              <ProtectedRoute requireAuth={false}>
                <PrivacyPolicy />
              </ProtectedRoute>
            } />


            {/* ── Catch-all ─────────────────────────────────────────────────── */}

            <Route path="*" element={
              <ProtectedRoute requireAuth={false}>
                <Navigate to="/" replace />
              </ProtectedRoute>
            } />

          </Routes>          </main>
          <Footer />        </div>
      </SignupProvider>
      </MessagingProvider>
    </AuthProvider>
  );
}

export default App;