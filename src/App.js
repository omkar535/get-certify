import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Home from "./Home";
import Generate from "./Generate";
import GenerateBatch from "./GenerateBatch";
import Templates from "./Templates";
import Certificates from "./Certificates";
import CertificatesByEvent from "./CertificatesByEvent"; // New Component
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/generateBatch" element={<GenerateBatch />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/certificates/:eventName" element={<CertificatesByEvent />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
