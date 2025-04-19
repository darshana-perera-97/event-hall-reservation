import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SuperAdmin from "./Pages/SuperAdmin";
import HotelLogin from "./Pages/HotelLogin";
import HotelDashboard from "./Pages/HotelDashboard";

export default function Design() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/superAdmin" element={<SuperAdmin />} />
          <Route path="/hotelLogin" element={<HotelLogin />} />
          <Route path="/hotelDashboard" element={<HotelDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
