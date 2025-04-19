import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HotelHalls() {
  const navigate = useNavigate();
  const hotelId = localStorage.getItem("hotelId");
  const [halls, setHalls] = useState([]);
  const [form, setForm] = useState({
    hallName: "",
    description: "",
    price: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load halls on mount
  useEffect(() => {
    if (!hotelId) {
      setError("Please log in first.");
      return;
    }
    fetch(`http://localhost:5000/api/hotels/${hotelId}/halls`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then(setHalls)
      .catch(() => setError("Failed to load halls."));
  }, [hotelId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleFileChange = (e) => setImageFile(e.target.files[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!form.hallName || !form.description || !form.price || !imageFile) {
      setMessage("All fields are required.");
      return;
    }

    const fd = new FormData();
    fd.append("hallName", form.hallName);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("image", imageFile);

    try {
      const res = await fetch(
        `http://localhost:5000/api/hotels/${hotelId}/halls`,
        { method: "POST", body: fd }
      );
      if (!res.ok) throw new Error("Failed to add hall");
      const newHall = await res.json();
      setHalls((h) => [...h, newHall]);
      setMessage("Hall added!");
      setForm({ hallName: "", description: "", price: "" });
      setImageFile(null);
    } catch {
      setMessage("Error adding hall.");
    }
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">{error}</div>
        <Link to="/hotelLogin" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Your Event Halls</h1>
      {message && <div className="alert alert-info">{message}</div>}

      {/* Add Hall Form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row">
          <div className="col-md-4 mb-3">
            <input
              type="text"
              name="hallName"
              className="form-control"
              placeholder="Hall Name"
              value={form.hallName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4 mb-3">
            <input
              type="text"
              name="description"
              className="form-control"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2 mb-3">
            <input
              type="number"
              name="price"
              className="form-control"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2 mb-3">
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
              required
            />
          </div>
        </div>
        <button className="btn btn-success">Add Hall</button>
      </form>

      {/* Halls Card Grid */}
      <div className="row">
        {halls.map((h) => (
          <div key={h.hallid} className="col-md-4 mb-4">
            <div className="card h-100">
              {h.imageUrl && (
                <img
                  src={`http://localhost:5000${h.imageUrl}`}
                  className="card-img-top"
                  alt={h.hallName}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{h.hallName}</h5>
                <p className="card-text">{h.description}</p>
              </div>
              <div className="card-footer">
                <strong>Price:</strong> ${h.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
        {halls.length === 0 && <p>No halls yet.</p>}
      </div>

      <Link to="/otelDashboard" className="btn btn-secondary mt-4">
        Back to Dashboard
      </Link>
    </div>
  );
}
