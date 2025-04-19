import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function HotelDashboard() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read hotelId once
  const hotelId = localStorage.getItem("hotelId");

  useEffect(() => {
    if (!hotelId) {
      setLoading(false);
      setError("You must be logged in to view the dashboard.");
      return;
    }

    fetch("http://localhost:5000/api/hotels")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((list) => {
        const found = list.find((h) => h.hotelId === hotelId);
        if (!found) {
          throw new Error("Hotel not found");
        }
        setHotel(found);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [hotelId]);

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
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

  // At this point we have a valid `hotel`
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Welcome, {hotel.hotelName}!</h1>
      <div className="row">
        {/* Hotel Details */}
        <div className="col-md-3 col-sm-6 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">Hotel Details</h5>
              <p className="card-text">View your hotel’s information</p>
            </div>
          </div>
        </div>
        {/* Event Halls */}
        <div className="col-md-3 col-sm-6 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">Event Halls</h5>
              <p className="card-text">Manage your event halls</p>
            </div>
          </div>
        </div>
        {/* Food Plates */}
        <div className="col-md-3 col-sm-6 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">Food Plates</h5>
              <p className="card-text">Configure menu items</p>
            </div>
          </div>
        </div>
        {/* Settings */}
        <div className="col-md-3 col-sm-6 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <h5 className="card-title">Settings</h5>
              <p className="card-text">Update your preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
