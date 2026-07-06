import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/login/Login"
import Dashboard from "./Pages/dashboard/Dashboard";
import EditDashboard from "./Pages/editdashboard/EditDashboard";
import Admin from "./Pages/admin/Admin";
import Leave from "./Pages/leave/Leave"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editdashboard" element={<EditDashboard/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/leave" element={<Leave/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;