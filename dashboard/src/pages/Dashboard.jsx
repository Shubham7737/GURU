import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [stats] = useState({
    students: 1234,
    courses: 56,
    memberships: 89,
    classes: 12,
    subjects: 34,
    revenue: 45678
  });

  const [isLoading] = useState(false);

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 5500 }
  ];

  const salesData = [
    { month: 'Jan', sales: 240 },
    { month: 'Feb', sales: 139 },
    { month: 'Mar', sales: 980 },
    { month: 'Apr', sales: 390 },
    { month: 'May', sales: 480 },
    { month: 'Jun', sales: 380 }
  ];

  const studentData = [
    { name: 'Active', value: 400, color: '#667eea' },
    { name: 'Inactive', value: 300, color: '#764ba2' },
    { name: 'Pending', value: 200, color: '#f093fb' }
  ];

  const recentActivities = [
    { id: 1, action: 'New student enrolled', user: 'John Doe', time: '2 minutes ago' },
    { id: 2, action: 'Course completed', user: 'Jane Smith', time: '15 minutes ago' },
    { id: 3, action: 'Membership purchased', user: 'Bob Johnson', time: '1 hour ago' },
    { id: 4, action: 'New course added', user: 'Admin', time: '2 hours ago' }
  ];

  const recentPurchases = [
    { id: 1, course: 'React Masterclass', student: 'Alice Brown', amount: '$99', date: '2024-01-15' },
    { id: 2, course: 'Node.js Fundamentals', student: 'Charlie Wilson', amount: '$79', date: '2024-01-14' },
    { id: 3, course: 'Python for Beginners', student: 'Diana Prince', amount: '$59', date: '2024-01-13' }
  ];

  const StatCard = ({ title, value, icon, color, isLoading }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        {isLoading ? (
          <div className="skeleton-loader"></div>
        ) : (
          <p className="stat-value">{typeof value === 'number' && value > 999 ? value.toLocaleString() : value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your platform.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={stats.students}
          icon="👥"
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Courses"
          value={stats.courses}
          icon="📚"
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Memberships"
          value={stats.memberships}
          icon="💎"
          color="purple"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Classes"
          value={stats.classes}
          icon="🏫"
          color="orange"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Subjects"
          value={stats.subjects}
          icon="📖"
          color="red"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon="💰"
          color="teal"
          isLoading={isLoading}
        />
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h2>Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Monthly Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#764ba2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Student Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {studentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="activity-section">
        <div className="activity-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">📋</div>
                <div className="activity-content">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-user">{activity.user}</p>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-card">
          <h2>Recent Purchases</h2>
          <div className="purchases-table">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{purchase.course}</td>
                    <td>{purchase.student}</td>
                    <td className="amount">{purchase.amount}</td>
                    <td>{purchase.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;