import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SuperAdmin from "./Pages/SuperAdmin";

export default function Design() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/superAdmin" element={<SuperAdmin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
