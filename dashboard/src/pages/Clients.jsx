import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { Toast, ConfirmModal } from '../components/Notification';
import '../css/Clients.css';

const API_BASE_URL = 'http://localhost:3000/api/v1/clients';

// Helper: create axios instance with token
const createClientApi = () => {
  const token = localStorage.getItem('adminToken');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ total: 0, students: 0, today: 0, thisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Search, Filter, Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  // FETCH DATA
  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const api = createClientApi();
      const response = await api.get('/?limit=1000');
      if (response.data.success) {
        setClients(response.data.data || []);
      } else {
        setToast({ show: true, message: 'Failed to fetch clients', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to fetch clients';
      setToast({ show: true, message: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const api = createClientApi();
      const response = await api.get('/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    const id = confirmModal.id;
    try {
      const api = createClientApi();
      await api.delete(`/${id}`);
      setToast({ show: true, message: 'Client deleted successfully! 🗑️', type: 'success' });
      fetchClients();
      fetchStats();
      // Close view modal if open
      if (selectedClient && selectedClient.id === id) {
        setViewModalOpen(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to delete client';
      setToast({ show: true, message: msg, type: 'error' });
    } finally {
      setConfirmModal({ show: false, id: null });
    }
  };

  // VIEW DETAIL
  const handleView = (client) => {
    setSelectedClient(client);
    setViewModalOpen(true);
  };

  // Avatar helper
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  };

  const getAvatarClass = (id) => {
    return `cl-avatar cl-avatar--${id % 8}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // FILTERING + SORTING
  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    const nameMatch = (client.name || '').toLowerCase().includes(search);
    const emailMatch = (client.email || '').toLowerCase().includes(search);
    const matchesSearch = nameMatch || emailMatch;
    const matchesRole = filterRole === 'all' || client.role === filterRole;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdat) - new Date(a.createdat);
    if (sortBy === 'oldest') return new Date(a.createdat) - new Date(b.createdat);
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
    return 0;
  });

  // PAGINATION
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const resetPagination = () => setCurrentPage(1);

  // TABLE COLUMNS
  const columns = [
    {
      key: 'name',
      label: 'Client',
      render: (value, row) => (
        <div className="cl-user-cell">
          <div className={getAvatarClass(row.id)}>
            {getInitials(value)}
          </div>
          <div className="cl-user-cell__info">
            <span className="cl-user-cell__name">{value || '—'}</span>
            <span className="cl-user-cell__email">{row.email || '—'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => <span>{value || '—'}</span>
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => {
        const role = (value || 'student').toLowerCase();
        return (
          <span className={`cl-badge cl-badge--${role}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'createdat',
      label: 'Joined Date',
      render: (value) => <span>{formatDate(value)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="cl-actions">
          <button
            className="cl-btn--icon view"
            title="View Details"
            onClick={() => handleView(row)}
          >
            👁️
          </button>
          <button
            className="cl-btn--icon delete"
            title="Delete Client"
            onClick={() => setConfirmModal({ show: true, id: row.id })}
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="cl-page">
      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={confirmModal.show}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ show: false, id: null })}
      />

      {/* Header */}
      <div className="cl-header">
        <div className="cl-header__text">
          <h1 className="cl-header__title">Client Management</h1>
          <p className="cl-header__subtitle">View and manage all registered students on the platform</p>
        </div>
        <div className="cl-header__actions">
          <button
            className="cl-btn cl-btn--ghost"
            onClick={() => { fetchClients(); fetchStats(); }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {isStatsLoading ? (
        <div className="cl-skeleton-stats">
          <div className="cl-skeleton-card"></div>
          <div className="cl-skeleton-card"></div>
          <div className="cl-skeleton-card"></div>
          <div className="cl-skeleton-card"></div>
        </div>
      ) : (
        <div className="cl-stats">
          <div className="cl-stats__card">
            <span className="cl-stats__icon cl-stats__icon--total">👥</span>
            <div>
              <h3 className="cl-stats__value">{stats.total}</h3>
              <p className="cl-stats__label">Total Clients</p>
            </div>
          </div>
          <div className="cl-stats__card">
            <span className="cl-stats__icon cl-stats__icon--students">🎓</span>
            <div>
              <h3 className="cl-stats__value">{stats.students}</h3>
              <p className="cl-stats__label">Students</p>
            </div>
          </div>
          <div className="cl-stats__card">
            <span className="cl-stats__icon cl-stats__icon--today">🆕</span>
            <div>
              <h3 className="cl-stats__value">{stats.today}</h3>
              <p className="cl-stats__label">Joined Today</p>
            </div>
          </div>
          <div className="cl-stats__card">
            <span className="cl-stats__icon cl-stats__icon--month">📅</span>
            <div>
              <h3 className="cl-stats__value">{stats.thisMonth}</h3>
              <p className="cl-stats__label">This Month</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="cl-table-section">
        {/* Controls */}
        <div className="cl-controls">
          <div className="cl-search">
            <span className="cl-search__icon">🔍</span>
            <input
              type="text"
              className="cl-search__input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
            />
          </div>
          <select
            className="cl-filter"
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); resetPagination(); }}
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
          </select>
          <select
            className="cl-sort"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); resetPagination(); }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
          <span className="cl-controls__count">
            Showing {paginatedClients.length} of {filteredClients.length} clients
          </span>
        </div>

        {/* Table */}
        <Table columns={columns} data={paginatedClients} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="cl-pagination">
            <button
              className="cl-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="cl-pagination__numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`cl-pagination__num ${currentPage === page ? 'cl-pagination__num--active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="cl-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}

        {/* Pagination info */}
        {filteredClients.length > 0 && (
          <p className="cl-pagination__info">
            Page {currentPage} of {totalPages} • Total {filteredClients.length} clients
          </p>
        )}
      </div>

      {/* View Client Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedClient(null);
        }}
        title="Client Details"
      >
        {selectedClient && (
          <div className="cl-detail">
            {/* Header with Avatar */}
            <div className="cl-detail__header">
              <div className="cl-detail__avatar">
                {getInitials(selectedClient.name)}
              </div>
              <div>
                <h2 className="cl-detail__name">{selectedClient.name || '—'}</h2>
                <p className="cl-detail__role">
                  <span className={`cl-badge cl-badge--${(selectedClient.role || 'student').toLowerCase()}`}>
                    {(selectedClient.role || 'student').charAt(0).toUpperCase() + (selectedClient.role || 'student').slice(1)}
                  </span>
                </p>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="cl-detail__grid">
              <div className="cl-detail__item">
                <p className="cl-detail__label">Client ID</p>
                <p className="cl-detail__value">#{selectedClient.id}</p>
              </div>
              <div className="cl-detail__item">
                <p className="cl-detail__label">Joined Date</p>
                <p className="cl-detail__value">{formatDateTime(selectedClient.createdat)}</p>
              </div>
              <div className="cl-detail__item cl-detail__item--full">
                <p className="cl-detail__label">Email Address</p>
                <p className="cl-detail__value">{selectedClient.email || '—'}</p>
              </div>
              <div className="cl-detail__item cl-detail__item--full">
                <p className="cl-detail__label">Full Name</p>
                <p className="cl-detail__value">{selectedClient.name || '—'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="cl-detail__actions">
              <button
                className="cl-btn cl-btn--ghost"
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedClient(null);
                }}
              >
                Close
              </button>
              <button
                className="cl-btn cl-btn--danger"
                onClick={() => {
                  setConfirmModal({ show: true, id: selectedClient.id });
                }}
              >
                🗑️ Delete Client
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients;
