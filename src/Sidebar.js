import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css"; // Ensure Sidebar.css is correctly linked

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/generate">Generate</Link></li>
        <li><Link to="/generatebatch">Generate Multiple</Link></li>
        <li><Link to="/templates">Templates</Link></li>  {/* ✅ Ensure this is correct */}
        <li><Link to="/certificates">Certificates</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
