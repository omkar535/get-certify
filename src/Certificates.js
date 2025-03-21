import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import medalIcon from "./medal.png"; // Import Medal Image
import "./Certificates.css";

function Certificates() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch unique events from Firestore certificates
  const fetchEvents = async () => {
    try {
      const certCollection = collection(db, "certificates");
      const certSnapshot = await getDocs(certCollection);
      const certList = certSnapshot.docs.map((doc) => doc.data());

      // Extract unique events
      const uniqueEvents = [...new Set(certList.map((cert) => cert.event))];
      setEvents(uniqueEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div className="events-container">
      <h2>Events</h2>
      <div className="events-list">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="event-card" onClick={() => navigate(`/certificates/${event}`)}>
              <img src={medalIcon} alt="Medal" className="medal-icon" />
              <span className="event-name">{event}</span>
            </div>
          ))
        ) : (
          <p>No events available.</p>
        )}
      </div>
    </div>
  );
}

export default Certificates;
