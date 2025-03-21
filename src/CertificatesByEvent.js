import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./Certificates.css";

function CertificatesByEvent() {
  const { eventName } = useParams();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    fetchCertificatesByEvent();
  }, []);

  // Fetch certificates filtered by event
  const fetchCertificatesByEvent = async () => {
    try {
      const certCollection = collection(db, "certificates");
      const certSnapshot = await getDocs(certCollection);
      const certList = certSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter certificates for the selected event
      const filteredCertificates = certList.filter((cert) => cert.event === eventName);
      setCertificates(filteredCertificates);

      // Extract event date (assuming all certificates for the event have the same date)
      if (filteredCertificates.length > 0) {
        setEventDate(filteredCertificates[0].date); // Assuming "date" field exists in Firestore
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const shareCertificate = (url) => {
    navigator.clipboard.writeText(url);
    alert("Certificate URL copied to clipboard!");
  };

  const deleteCertificate = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this certificate?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "certificates", id));
        setCertificates(certificates.filter((cert) => cert.id !== id));
        alert("Certificate deleted successfully!");
      } catch (error) {
        console.error("Error deleting certificate:", error);
      }
    }
  };

  return (
    <div className="certificates-container">
      <div className="event-header">
        <button className="back-btn" onClick={() => navigate("/certificates")}>⬅ Back to Events</button>
        <h2>Certificates for {eventName}</h2>
        {eventDate && <p className="event-date">📅 {eventDate}</p>}
      </div>

      <div className="certificates-list">
        {certificates.length > 0 ? (
          certificates.map((certificate) => (
            <div key={certificate.id} className="certificate-card">
              <img
                src={certificate.url}
                alt={`${certificate.name}_${certificate.event}`}
                className="certificate-image"
              />
              <p className="certificate-info">
                <strong>{certificate.name}</strong> - {certificate.event}
              </p>
              <div className="certificate-actions">
                <button className="share-btn" onClick={() => shareCertificate(certificate.url)}>
                  📤 Share
                </button>
                <button className="delete-btn" onClick={() => deleteCertificate(certificate.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No certificates available for this event.</p>
        )}
      </div>
    </div>
  );
}

export default CertificatesByEvent;
