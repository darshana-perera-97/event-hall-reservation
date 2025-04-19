import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function HotelDetails() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const hotelId = localStorage.getItem("hotelId");
    if (!hotelId) {
      setError("You must be logged in to view details.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/hotels/${hotelId}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((b) => {
            throw new Error(b.error || res.statusText);
          });
        }
        return res.json();
      })
      .then((data) => {
        setHotel(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center mt-5">Loading hotel details…</p>;
  }
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

  // Render hotel fields:
  return (
    <div className="container mt-5">
      <h1 className="mb-4">{hotel.hotelName}</h1>
      {hotel.imageUrl && (
        <img
          src={`http://localhost:5000${hotel.imageUrl}`}
          className="img-fluid mb-4"
          alt={hotel.hotelName}
          style={{ maxHeight: 300, objectFit: "cover" }}
        />
      )}

      <div className="mb-3">
        <strong>Description:</strong>
        <p>{hotel.description}</p>
      </div>

      <ul className="list-group mb-4">
        <li className="list-group-item">
          <strong>Province:</strong> {hotel.location.province}
        </li>
        <li className="list-group-item">
          <strong>Town:</strong> {hotel.location.town}
        </li>
        <li className="list-group-item">
          <strong>Email:</strong> {hotel.email}
        </li>
        <li className="list-group-item">
          <strong>Telephone:</strong> {hotel.tp}
        </li>
        <li className="list-group-item">
          <strong>Created At:</strong>{" "}
          {new Date(hotel.createdAt).toLocaleString()}
        </li>
      </ul>

      <Link to="/otelDashboard" className="btn btn-secondary">
        Back to Dashboard
      </Link>
    </div>
  );
}
