import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./Components/login";
import Register from "./Components/register";
import Home from "./Components/homepage"; // Home will now render its own footer
import Overview from "./Dashboard/Overview";
import StartupsList from "./Components/StartupList";
import { isLoggedIn, isAdmin, getUserRole } from "./config/localstorage";
import Navbar from "./Components/Navbar";
import Products from "./Components/Products";
import Chat from "./Components/chat";
import MyMarket from "./Components/MyMarket";
import ManageProducts from "./Components/ManageProducts";
import ProfilePage from "./Components/ProfilePage"; // Import ProfilePage
import UpdateProfilePage from "./Components/UpdateProfilePage"; // Import UpdateProfilePage
import Community from "./Components/Community"; // Import Community
import CommunityGuard from './Components/CommunityGuard'; // Import CommunityGuard
import Footer from "./Components/Footer";
import { CartProvider } from './contexts/CartContext';
import Cart from './Components/Cart';
import { useState } from "react";
import Order from './Components/Order';
import Payment from './Components/Payment';
// Modifier cette ligne pour pointer vers le bon dossier
import AcceleratorDashboard from './Dashboard/AcceleratorDashboard';

// --- Helper Components for Routes ---

const AdminRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StartupRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  const userRole = getUserRole()?.toLowerCase();
  // Permettre l'accès aux startups ET aux incubateurs
  if (userRole !== "startup" && userRole !== "accelerateur/incubateur" && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Ajouter nouveau guard pour accélérateurs
const AcceleratorRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  const userRole = getUserRole()?.toLowerCase(); // Ajout de toLowerCase()
  if (userRole !== "accelerateur/incubateur") { // Modification de la casse
    return <Navigate to="/" replace />;
  }
  return children;
};

// --- Layout Component for pages with Navbar BUT NO Footer ---
// Footer will be handled by the specific page component (like Home)
const MainLayoutNoFooter = ({ children }) => {
  return (
    <>
      <Navbar />
      {/* This div takes up space, page component handles footer */}
      <div className="flex-grow">{children}</div>
      {/* MODIFICATION: Removed Footer from here */}
      {/* <Footer className="mt-auto" /> */}
    </>
  );
};

// --- Layout Component for Admin pages (example) ---
// Assuming admin pages also handle their own footer or don't need one in this specific layout
const AdminLayoutNoFooter = ({ children }) => {
  return (
    <>
      {/* Optional: Add Admin specific Navbar/Sidebar here */}
      <div className="flex-grow">{children}</div>
       {/* MODIFICATION: Removed Footer from here */}
      {/* <Footer className="mt-auto" /> */}
    </>
  );
};


function App() {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();

  // Modifier la liste des routes où la navbar doit être cachée
  const hideNavbar = [
    '/login', 
    '/register',
    '/accelerator/dashboard',  // Ajouter le dashboard accélérateur
    '/dashboard/overview',     // Ajouter les routes du dashboard admin
    '/dashboard/startups',
    '/dashboard/*'
  ].some(path => {
    if (path.endsWith('*')) {
      return location.pathname.startsWith(path.slice(0, -1));
    }
    return location.pathname === path;
  });

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {!hideNavbar && <Navbar onCartClick={() => setShowCart(true)} />}
        <Routes>
          {/* Auth routes without navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Homepage Route --- */}
          {/* Home now renders Navbar AND Footer internally or expects them passed */}
          {/* Simplest is to just render Home which includes its own structure + Footer */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                {/* Home component now contains its own Footer */}
                {/* No wrapper needed here if Home handles flex-grow internally */}
                <Home />
              </>
            }
          />

          {/* --- Other Routes potentially using a Layout --- */}
          {/* Example: Products page - Does it need a footer? If yes, render it inside Products.jsx or use a layout *with* footer */}
          <Route
            path="/dashboard/products"
            element={
              <>
                <Navbar />
                <div className="flex-grow"> <Products /> </div> {/* Products would need footer */}
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <div className="flex-grow p-10 text-black dark:text-white">About Page Content</div>
                <Footer className="mt-auto"/>
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Navbar />
                <div className="flex-grow p-10 text-black dark:text-white">Contact Page Content</div>
                <Footer className="mt-auto"/>
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <Navbar />
                <div className="flex-grow p-10 text-black dark:text-white">Privacy Policy Content</div>
                <Footer className="mt-auto"/>
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <Navbar />
                <div className="flex-grow p-10 text-black dark:text-white">Terms of Service Content</div>
                <Footer className="mt-auto"/>
              </>
            }
          />

          {/* Protected Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <div className="flex-grow"> <ProfilePage /> </div> {/* Use ProfilePage component */}
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-profile"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <div className="flex-grow"> <UpdateProfilePage /> </div> {/* Use UpdateProfilePage component */}
                </>
              </ProtectedRoute>
            }
          />

          {/* Startup specific routes */}
          {/* Assuming these pages also need Navbar/Footer */}
          <Route
            path="/my-market"
            element={
              <StartupRoute>
                <>
                  <Navbar />
                  <div className="flex-grow"> <MyMarket /> </div>
                </>
              </StartupRoute>
            }
          />
          <Route
            path="/manage-products"
            element={
              <StartupRoute>
                <>
                  <Navbar />
                  <div className="flex-grow"> <ManageProducts /> </div>
                </>
              </StartupRoute>
            }
          />
          {/* Routes with params */}
          <Route path="/manage-products/:action" element={ <StartupRoute> <> <Navbar /> <div className="flex-grow"> <ManageProducts /> </div> <Footer className="mt-auto"/> </> </StartupRoute> } />
          <Route path="/manage-products/:action/:id" element={ <StartupRoute> <> <Navbar /> <div className="flex-grow"> <ManageProducts /> </div> <Footer className="mt-auto"/> </> </StartupRoute> } />


          {/* Chat Routes (Likely no Footer needed) */}
          <Route path="/chat" element={ <StartupRoute> <Chat /> </StartupRoute> } />
          <Route path="/chat/:displayName" element={ <StartupRoute> <Chat /> </StartupRoute> } />

          {/* --- Admin Dashboard Routes --- */}
          <Route
            path="/dashboard/overview"
            element={
              <AdminRoute>
                <Overview />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/startups"
            element={
              <AdminRoute>
                <>
                  <div className="flex-grow"> <StartupsList /> </div>
                  <Footer className="mt-auto"/>
                </>
              </AdminRoute>
            }
          />
          <Route path="/dashboard/*" element={ <AdminRoute> <Navigate to="/dashboard/overview" replace /> </AdminRoute> } />

          {/* Community Route */}
          <Route
            path="/community"
            element={
              <StartupRoute>
                <>
                  <Navbar />
                  <div className="flex-grow">
                    <CommunityGuard>
                      <Community />
                    </CommunityGuard>
                  </div>
                </>
              </StartupRoute>
            }
          />

          {/* Order and Payment Routes */}
          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* Accelerator Dashboard Routes */}
          <Route
            path="/accelerator/dashboard"
            element={
              <AcceleratorRoute>
                <AcceleratorDashboard />
              </AcceleratorRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Cart Modal */}
        <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
      </div>
    </CartProvider>
  );
}

export default App;