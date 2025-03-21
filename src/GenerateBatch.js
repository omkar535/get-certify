import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { db } from "./Firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import axios from "axios";
import "./Generate.css";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djxkowcok/image/upload";
const UPLOAD_PRESET = "certify";

const fonts = ["Arial", "Times New Roman", "Georgia", "Verdana", "Courier New"];

function GenerateBatch() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [date, setDate] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      setUploadedData(data);
    };
  };

  const generateCertificates = async () => {
    if (!selectedEvent || !date || !selectedTemplate || uploadedData.length === 0) {
      alert("Please complete all steps before generating certificates.");
      return;
    }

    setUploading(true);

    for (const entry of uploadedData) {
      const { Name, Email } = entry;
      if (!Name || !Email) continue;

      await generateSingleCertificate(Name, Email);
    }

    setUploading(false);
    alert("Certificates generated and sent successfully!");
  };

  const generateSingleCertificate = async (name, email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tempDiv = document.createElement("div");
        tempDiv.className = "certificate";
        tempDiv.innerHTML = `
          <img src="${selectedTemplate.url}" alt="Certificate Template" class="certificate-background" />
          <div class="certificate-text" style="font-family: ${selectedFont};">
            <h1 class="certificate-title">Certificate of Achievement</h1>
            <p class="certificate-subtext">Awarded to</p>
            <h2 class="certificate-name">${name}</h2>
            <p class="certificate-subtext">For participation in</p>
            <h3 class="certificate-event-name">${selectedEvent}</h3>
            <p class="certificate-date">on ${date}</p>
          </div>
        `;

        document.body.appendChild(tempDiv);

        html2canvas(tempDiv, {
          scale: 1,
          useCORS: true,
        }).then(async (canvas) => {
          const imageData = canvas.toDataURL("image/png");
          document.body.removeChild(tempDiv);

          const cloudinaryUrl = await uploadToCloudinary(imageData);

          if (cloudinaryUrl) {
            await saveToFirestore(name, email, cloudinaryUrl);
            await sendEmail(name, email, cloudinaryUrl);
          }

          resolve();
        });
      }, 500);
    });
  };

  const uploadToCloudinary = async (imageData) => {
    try {
      const formData = new FormData();
      formData.append("file", imageData);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const saveToFirestore = async (name, email, cloudinaryUrl) => {
    try {
      await addDoc(collection(db, "certificates"), {
        name,
        event: selectedEvent,
        date,
        email,
        url: cloudinaryUrl,
      });
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  };

  const sendEmail = async (name, email, certificateUrl) => {
    try {
      const templateParams = {
        to_email: email,
        name,
        event: selectedEvent,
        certificate_link: certificateUrl,
      };

      await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
        service_id: "service_f031lws",
        template_id: "template_6zrehgj",
        user_id: "W82yNJmaq89FNyMA2",
        template_params: templateParams,
      });

      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error("Email sending error:", error);
    }
  };

  return (
    <div className="generate-container">
      <h2>Generate Batch Certificates</h2>

      <div className="input-section">
        <label>Enter Event Name:</label>
        <input 
          type="text" 
          value={selectedEvent} 
          onChange={(e) => setSelectedEvent(e.target.value)} 
          placeholder="Enter event name"
        />

        <label>Select Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Select Template:</label>
        <select onChange={(e) => {
          const selected = templates.find(t => t.id === e.target.value);
          setSelectedTemplate(selected);
        }}>
          <option value="">Select a Template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.template}
            </option>
          ))}
        </select>

        <label>Select Font:</label>
        <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
          {fonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        {selectedTemplate && (
          <div className="certificate-preview">
            <h3>Certificate Preview</h3>
            <div className="certificate" style={{ fontFamily: selectedFont }}>
              <img src={selectedTemplate.url} alt="Certificate Template" className="certificate-background" />
              <div className="certificate-text">
                <h1 className="certificate-title">Certificate of Participation</h1>
                <p className="certificate-subtext">Awarded to</p>
                <h2 className="certificate-name">[Name]</h2>
                <p className="certificate-subtext">For participation in</p>
                <h3 className="certificate-event-name">{selectedEvent}</h3>
                <p className="certificate-date">on {date}</p>
              </div>
            </div>
          </div>
        )}

        <label>Upload Excel File:</label>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

        <button onClick={generateCertificates} disabled={uploading}>
          {uploading ? "Processing..." : "Generate & Send Certificates"}
        </button>
      </div>
    </div>
  );
}

export default GenerateBatch;
