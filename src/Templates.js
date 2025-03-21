import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";
import "./Templates.css";

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch templates from Firestore
  const fetchTemplates = async () => {
    const templateCollection = collection(db, "Template");
    const templateSnapshot = await getDocs(templateCollection);
    const templateList = templateSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTemplates(templateList);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      setSelectedFile(file);
    }
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "certify");

    try {
      console.log("Uploading file to Cloudinary...");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/djxkowcok/image/upload",
        formData
      );
      console.log("Cloudinary response:", response.data);
      return response.data.secure_url; // Return uploaded image URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      alert("Failed to upload image to Cloudinary.");
      return null;
    }
  };

  // Handle Upload
  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) {
      alert("Please select a file and enter a template name.");
      return;
    }

    console.log("Starting upload...");
    const imageUrl = await uploadToCloudinary(selectedFile);

    if (imageUrl) {
      console.log("Saving to Firestore...");
      await addDoc(collection(db, "Template"), {
        template: templateName,
        url: imageUrl,
      });

      alert("Template uploaded successfully!");
      fetchTemplates(); // Refresh template list
      setShowUploadPopup(false); // Close popup after completion
      setSelectedFile(null); // Clear file input
      setTemplateName(""); // Clear input field
    }
  };

  // Handle Template Deletion
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this template?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "Template", id));
        alert("Template deleted successfully!");
        setTemplates(templates.filter((template) => template.id !== id)); // Update UI
      } catch (error) {
        console.error("Error deleting template:", error);
        alert("Error deleting template!");
      }
    }
  };

  // Show Preview
  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  // Close Preview
  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="templates-container">
      <h2>Available Templates</h2>
      <div className="templates-list">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.id} className="template-card">
              <img 
                src={template.url} 
                alt={template.template} 
                className="template-image" 
                onClick={() => handlePreview(template.url)} // Click to preview
              />
              <p>{template.template}</p>
              <button className="delete-btn" onClick={() => handleDelete(template.id)}>🗑️ Delete</button>
            </div>
          ))
        ) : (
          <p>No templates available.</p>
        )}
      </div>

      {/* Floating Upload Button */}
      <button className="floating-upload-btn" onClick={() => setShowUploadPopup(!showUploadPopup)}>
        +
      </button>

      {/* Upload Popup */}
      <div className={`upload-popup ${showUploadPopup ? "active" : ""}`}>
        <h3>Upload New Template</h3>
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Enter Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
}

export default Templates;
