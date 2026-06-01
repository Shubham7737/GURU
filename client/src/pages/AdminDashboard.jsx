import React from "react";
import DashboardStats from "../components/DashboardStats";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-dashboard container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <DashboardStats />
      {/* Additional admin sections can be added here */}
    </div>
  );
}

export default AdminDashboard;
