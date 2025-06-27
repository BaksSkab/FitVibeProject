"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const TrainerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    education: "",
    achievements: "",
    instagram_url: "",
    linkedin_url: "",
    profile_image_url: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8001/trainer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);  
        setForm({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          bio: res.data.bio || "",
          education: res.data.education || "",
          achievements: res.data.achievements || "",
          profile_image_url: res.data.profile_image_url || "",
          instagram_url: res.data.instagram_url || "",
          linkedin_url: res.data.linkedin_url || "",
        });
      })
      .catch((err) => {
        setError("Failed to fetch profile.");
        console.error(err);
      });
  }, []);


  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:8001/trainer/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  };

  if (!profile) {
    return <div className="trainer-profile-container">Loading...</div>;
  }

 return (
  <div className="trainer-profile-wrapper">
    <h1 className="profile-heading">👤 Trainer Profile</h1>

    {success && <p className="success-msg">{success}</p>}
    {error && <p className="error-msg">{error}</p>}

    <div className="profile-card-modern">
      <div className="profile-columns">
        {/* Lijeva strana – podaci */}
        <div className="profile-info-left">
          {editMode ? (
            <form onSubmit={handleSubmit} className="profile-form-modern">
              <label>First Name:</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} />

              <label>Last Name:</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} />

              <label>Email:</label>
              <input type="email" name="email" value={form.email} disabled />

              <label>Phone:</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />

              <label>Bio:</label>
              <textarea name="bio" value={form.bio || ""} onChange={handleChange} />

              <label>Education:</label>
              <textarea name="education" value={form.education || ""} onChange={handleChange} />

              <label>Achievements:</label>
              <textarea name="achievements" value={form.achievements || ""} onChange={handleChange} />

              <label>Instagram URL:</label>
              <input type="text" name="instagram_url" value={form.instagram_url || ""} onChange={handleChange} />

              <label>LinkedIn URL:</label>
              <input type="text" name="linkedin_url" value={form.linkedin_url || ""} onChange={handleChange} />

              <label>Profile Image URL:</label>
              <input type="text" name="profile_image_url" value={form.profile_image_url || ""} onChange={handleChange} />

              <div className="button-group-modern">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-info-modern">
              <p><strong>Name:</strong> {form.first_name} {form.last_name}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Phone:</strong> {form.phone || "Not provided"}</p>
              <p><strong>Bio:</strong> {form.bio || "Not provided"}</p>
              <p><strong>Education:</strong> {form.education || "Not provided"}</p>
              <p><strong>Achievements:</strong> {form.achievements || "Not provided"}</p>
              <p><strong>Instagram:</strong> {form.instagram_url || "Not provided"}</p>
              <p><strong>LinkedIn:</strong> {form.linkedin_url || "Not provided"}</p>
              <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
          )}
        </div>

        {/* Desna strana – profilna slika */}
        <div className="profile-image-right">
          <img
            src={form.profile_image_url || "/default-profile.png"}
            alt="Profile"
            className="profile-img-large"
          />
        </div>
      </div>
    </div>
  </div>
);


};

export default TrainerProfile;