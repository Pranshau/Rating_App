import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import Stores from "./pages/Stores";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/owner/dashboard"
          element={<ProtectedRoute allowedRoles={["owner"]}><OwnerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/stores"
          element={<ProtectedRoute allowedRoles={["user","admin","owner"]}><Stores /></ProtectedRoute>}
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
