import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Home.css";

function Home() {
  const [certificateCount, setCertificateCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  // Fetch counts of certificates and templates
  const fetchCounts = async () => {
    try {
      const certCollection = collection(db, "certificates");
      const certSnapshot = await getDocs(certCollection);
      setCertificateCount(certSnapshot.size);

      const templateCollection = collection(db, "Template");
      const templateSnapshot = await getDocs(templateCollection);
      setTemplateCount(templateSnapshot.size);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-2xl">Welcome to the Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card">
          <h2>Generated Certificates</h2>
          <p>{certificateCount}</p>
        </div>
        <div className="stat-card">
          <h2>Available Templates</h2>
          <p>{templateCount}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
