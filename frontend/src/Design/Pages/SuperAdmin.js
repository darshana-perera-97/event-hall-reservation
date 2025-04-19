import React, { useState, useEffect } from "react";

export default function SuperAdmin() {
  // ─── 1) DECLARE ALL HOOKS AT THE TOP ─────────────────────────────────────────

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Hotel form state
  const [form, setForm] = useState({
    hotelName: "",
    description: "",
    province: "",
    town: "",
    email: "",
    tp: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // Dropdown state
  const [towns, setTowns] = useState([]);

  // Fetched hotels & messages
  const [hotels, setHotels] = useState([]);
  const [message, setMessage] = useState("");

  // ─── 2) CONSTANTS FOR PROVINCES / CITIES ────────────────────────────────────
  const provinces = [
    "Central",
    "Eastern",
    "North Central",
    "Northern",
    "North Western",
    "Sabaragamuwa",
    "Southern",
    "Uva",
    "Western",
  ];
  const provinceCityMap = {
    Central: ["Kandy", "Matale", "Nuwara Eliya"],
    Eastern: ["Trincomalee", "Batticaloa", "Ampara"],
    "North Central": ["Anuradhapura", "Polonnaruwa"],
    Northern: ["Jaffna", "Kilinochchi", "Vavuniya"],
    "North Western": ["Kurunegala", "Puttalam"],
    Sabaragamuwa: ["Ratnapura", "Kegalle"],
    Southern: ["Galle", "Matara", "Hambantota"],
    Uva: ["Badulla", "Monaragala"],
    Western: ["Colombo", "Gampaha", "Kalutara"],
  };

  // ─── 3) FETCH EXISTING HOTELS ONCE ──────────────────────────────────────────
  useEffect(() => {
    fetch("http://localhost:5000/api/hotels")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => setHotels(Array.isArray(data) ? data : []))
      .catch(() => setHotels([]));
  }, []);

  // ─── 4) HANDLER FUNCTIONS ──────────────────────────────────────────────────

  // Login handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((f) => ({ ...f, [name]: value }));
  };
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.username === "admin" && loginForm.password === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  // Hotel-form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleProvinceChange = (e) => {
    const prov = e.target.value;
    setForm((f) => ({ ...f, province: prov, town: "" }));
    setTowns(provinceCityMap[prov] || []);
  };
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!imageFile) {
      setMessage("Please select an image.");
      return;
    }

    const formData = new FormData();
    Object.entries({
      hotelName: form.hotelName,
      description: form.description,
      province: form.province,
      town: form.town,
      email: form.email,
      tp: form.tp,
      password: form.password,
    }).forEach(([k, v]) => formData.append(k, v));
    formData.append("image", imageFile);

    try {
      const res = await fetch("http://localhost:5000/api/hotels", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      const created = await res.json();
      setHotels((h) => [...h, created]);
      setMessage("Hotel created successfully!");
      // reset form
      setForm({
        hotelName: "",
        description: "",
        province: "",
        town: "",
        email: "",
        tp: "",
        password: "",
      });
      setImageFile(null);
      setTowns([]);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  // ─── 5) RENDER ─────────────────────────────────────────────────────────────

  // 5a) If not logged in, show the login form
  if (!isLoggedIn) {
    return (
      <div className="container mt-5" style={{ maxWidth: 400 }}>
        <h2 className="mb-4">Admin Login</h2>
        {loginError && <div className="alert alert-danger">{loginError}</div>}
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={loginForm.username}
              onChange={handleLoginChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Login
          </button>
        </form>
      </div>
    );
  }

  // 5b) Otherwise, show the hotel-creation form + cards
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Super Admin: Create Hotel</h1>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        {/* Hotel Name */}
        <div className="mb-3">
          <label className="form-label">Hotel Name</label>
          <input
            type="text"
            className="form-control"
            name="hotelName"
            value={form.hotelName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Province & Town */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Province</label>
            <select
              className="form-select"
              name="province"
              value={form.province}
              onChange={handleProvinceChange}
              required
            >
              <option value="">-- Select Province --</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Town / City</label>
            <select
              className="form-select"
              name="town"
              value={form.town}
              onChange={handleChange}
              required
              disabled={!form.province}
            >
              <option value="">-- Select Town --</option>
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Telephone */}
        <div className="mb-3">
          <label className="form-label">Telephone</label>
          <input
            type="text"
            className="form-control"
            name="tp"
            value={form.tp}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="form-label">Hotel Image</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Hotel
        </button>
      </form>

      {/* Existing Hotels as Cards */}
      <hr className="my-5" />
      <h2>Existing Hotels</h2>
      {hotels.length > 0 ? (
        <div className="row">
          {hotels.map((h) => (
            <div key={h.hotelId} className="col-md-4 mb-4">
              <div className="card h-100">
                {h.imageUrl && (
                  <img
                    src={`http://localhost:5000${h.imageUrl}`}
                    className="card-img-top"
                    alt={h.hotelName}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{h.hotelName}</h5>
                  <p className="card-text">{h.description}</p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <strong>Province:</strong> {h.location.province}
                  </li>
                  <li className="list-group-item">
                    <strong>Town:</strong> {h.location.town}
                  </li>
                  <li className="list-group-item">
                    <strong>Email:</strong> {h.email}
                  </li>
                  <li className="list-group-item">
                    <strong>Telephone:</strong> {h.tp}
                  </li>
                </ul>
                <div className="card-footer text-muted">
                  Created: {new Date(h.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hotels yet.</p>
      )}
    </div>
  );
}
