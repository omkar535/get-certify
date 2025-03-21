import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { db } from "./Firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import axios from "axios";
import "./Generate.css";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djxkowcok/image/upload";
const UPLOAD_PRESET = "certify";

function Generate() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [email, setEmail] = useState(""); // Email input
  const [certificateType, setCertificateType] = useState("Participation");
  const [fontStyle, setFontStyle] = useState("Arial");
  const [alignment, setAlignment] = useState("center"); // Default alignment to center
  const [generatedImage, setGeneratedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const certificateRef = useRef(null);

  // Fetch templates from Firestore
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templateCollection = collection(db, "Template");
        const templateSnapshot = await getDocs(templateCollection);
        const templateList = templateSnapshot.docs.map((doc) => ({
          id: doc.id,
          template: doc.data().template,
          url: doc.data().url,
        }));
        setTemplates(templateList);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  // Generate Certificate - Captures Image & Displays it
  const generateCertificate = async () => {
    if (!selectedTemplate || !name || !eventName || !date) {
      alert("Please select a template and fill all fields before generating the certificate.");
      return;
    }

    setTimeout(() => {
      html2canvas(certificateRef.current, {
        scale: 1,
        useCORS: true,
      }).then(async (canvas) => {
        const imageData = canvas.toDataURL("image/png");
        setGeneratedImage(imageData);
        await uploadToCloudinary(imageData);
      });
    }, 500);
  };

  // Upload Image to Cloudinary & Save URL in Firestore
  const uploadToCloudinary = async (imageData) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageData);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        await saveToFirestore(data.secure_url);
      } else {
        throw new Error("Cloudinary upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading certificate!");
    }
    setUploading(false);
  };

  // Save Name, Event, URL & Email in Firestore
  const saveToFirestore = async (cloudinaryUrl) => {
    try {
      await addDoc(collection(db, "certificates"), {
        name: name,
        event: eventName,
        date: date,
        email: email || null, // Save email if entered, otherwise null
        url: cloudinaryUrl,
      });

      if (email) {
        await sendEmail(name, eventName, email, cloudinaryUrl);
      } else {
        alert("Certificate uploaded successfully!");
      }
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      alert("Error saving certificate details!");
    }
  };

  // Function to send email
  const sendEmail = async (name, eventName, email, certificateUrl) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const templateParams = {
        to_email: email, // Recipient email
        name: name, // User's name
        event: eventName, // Event name
        certificate_link: certificateUrl, // URL of the generated certificate
      };

      // Log to see what is being sent to EmailJS for debugging
      console.log("Sending email with params:", templateParams);

      const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
        service_id: "service_f031lws",        // Ensure this is correct
        template_id: "template_6zrehgj",      // Ensure this is correct
        user_id: "W82yNJmaq89FNyMA2",         // Ensure this is correct
        template_params: templateParams,      // This is the email details
      });

      console.log("Email sent response:", response); // Log the response from EmailJS

      if (response.status === 200) {
        alert("Certificate sent to email successfully!");
      } else {
        alert("Failed to send email!");
      }
    } catch (error) {
      console.error("Email sending error:", error);
      alert("Failed to send email!");
    }
  };

  // Download Certificate
  const downloadCertificate = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `${name}_${certificateType}_Certificate.png`;
    link.click();
  };

  return (
    <div className="generate-container">
      <h2>Generate Your Certificate</h2>

      <div className="input-section">
        <select onChange={(e) => {
          const selected = templates.find(t => t.id === e.target.value);
          setSelectedTemplate(selected);
          setGeneratedImage(null);
        }}>
          <option value="">Select a Template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.template}
            </option>
          ))}
        </select>

        <input type="text" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Enter Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="email" placeholder="Enter Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Certificate Type:</label>
        <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
          <option value="Participation">Participation</option>
          <option value="Winner">Winner</option>
          <option value="Runner-up">Runner-up</option>
          <option value="Completion">Completion</option>
        </select>

        <label>Font Style:</label>
        <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>

        <label>Text Alignment:</label>
        <select value={alignment} onChange={(e) => setAlignment(e.target.value)}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>

        <button onClick={generateCertificate} disabled={uploading}>
          {uploading ? "Uploading..." : "Generate Certificate"}
        </button>
      </div>

      {/* Certificate Preview */}
      {selectedTemplate && (
        <div className="certificate-preview">
          <h3>Certificate Preview</h3>
          <div className="certificate" ref={certificateRef}>
            <img src={selectedTemplate.url} alt="Certificate Template" className="certificate-background" />
            <div className="certificate-text" style={{ fontFamily: fontStyle, textAlign: alignment }}>
              <h1>{certificateType} Certificate</h1>
              <p>This is proudly presented to</p>
              <h2>{name}</h2>
              <p>For outstanding achievement in</p>
              <h3>{eventName}</h3>
              <p>Awarded on {date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Show Generated Certificate */}
      {generatedImage && (
        <div className="generated-certificate">
          <h3>Generated Certificate</h3>
          <img src={generatedImage} alt="Generated Certificate" />
          <button onClick={downloadCertificate}>Download Certificate</button>
        </div>
      )}
    </div>
  );
}

export default Generate;
