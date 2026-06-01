import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { Toast, ConfirmModal } from '../components/Notification';
import '../css/Memberships.css';

const API_BASE_URL = 'http://localhost:3000/api/v1/membership';

// Helper: create axios instance with token
const createMembershipApi = () => {
  const token = localStorage.getItem('adminToken');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    duration_time: '',
    status: 'active',
    price: ''
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Notification States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  // FETCH ALL DATA
  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    setIsLoading(true);
    try {
      const api = createMembershipApi();
      const response = await api.get('/');
      if (response.data.success) {
        const mappedData = response.data.data.map(item => {
          const rawStatus = item.status !== undefined ? String(item.status).toLowerCase() : 'active';
          const normalizedStatus = rawStatus === '0' || rawStatus === 'inactive' ? 'inactive' : 'active';

          return {
            id: item.id,
            name: item.name,
            duration_time: item.duration_time,
            price: String(item.price ?? ''), // ensure string for filter
            status: normalizedStatus
          };
        });
        setMemberships(mappedData);
      } else {
        setToast({ show: true, message: 'Failed to fetch memberships', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to fetch memberships';
      setToast({ show: true, message: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Plan name is required';
    if (!formData.duration_time.trim()) newErrors.duration_time = 'Duration is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    return newErrors;
  };

  // CREATE OR UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const api = createMembershipApi();

      const payload = {
        name: formData.name,
        duration_time: formData.duration_time,
        price: formData.price,
        status: formData.status
      };

      console.log('=== SUBMIT ===');
      console.log('editingId:', editingId);
      console.log('payload:', payload);

      if (editingId) {
        await api.put(`/${editingId}`, payload);
        setToast({ show: true, message: 'Membership updated successfully! ✅', type: 'success' });
      } else {
        await api.post('/', payload);
        setToast({ show: true, message: 'Membership created successfully! ✅', type: 'success' });
      }

      setFormData({ name: '', duration_time: '', status: 'active', price: '' });
      setEditingId(null);
      setIsModalOpen(false);
      fetchMemberships();
    } catch (error) {
      console.error('Error saving membership:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setToast({ show: true, message: 'Failed to save membership: ' + errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // PREPARE EDIT
  const handleEdit = (row) => {
    console.log('Editing row:', row);
    const normalizedStatus = row.status === 'inactive' || row.status === '0' || row.status === 0 ? 'inactive' : 'active';
    setEditingId(row.id);
    setFormData({
      name: row.name,
      duration_time: row.duration_time,
      status: normalizedStatus,
      price: row.price
    });
    setIsModalOpen(true);
  };

  // DELETE
  const handleDelete = async () => {
    const id = confirmModal.id;
    try {
      const api = createMembershipApi();
      await api.delete(`/${id}`);
      setToast({ show: true, message: 'Membership deleted successfully! 🗑️', type: 'success' });
      fetchMemberships();
    } catch (error) {
      console.error('Error deleting membership:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to delete membership';
      setToast({ show: true, message: msg, type: 'error' });
    } finally {
      setConfirmModal({ show: false, id: null });
    }
  };

  const filteredMemberships = memberships.filter(membership => {
    const search = searchTerm.toLowerCase();
    const nameMatch = membership.name?.toLowerCase().includes(search);
    const priceMatch = String(membership.price ?? '').toLowerCase().includes(search);
    const matchesSearch = nameMatch || priceMatch;
    const matchesFilter = filterStatus === 'all' || membership.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredMemberships.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMemberships = filteredMemberships.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const resetPagination = () => setCurrentPage(1);

  const columns = [
    { key: 'name', label: 'Plan Name' },
    { key: 'duration_time', label: 'Duration' },
    { key: 'price', label: 'Price' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusStr = String(value || 'active').toLowerCase();
        const displayStatus = (statusStr === '0' || statusStr === '1')
          ? (statusStr === '0' ? 'inactive' : 'active')
          : statusStr;

        return (
          <span className={`mb-badge mb-badge--${displayStatus}`}>
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="mb-actions">
          <button className="mb-actions__edit" onClick={() => handleEdit(row)}>✏️</button>
          <button className="mb-actions__delete" onClick={() => setConfirmModal({ show: true, id: row.id })}>🗑️</button>
        </div>
      )
    }
  ];

  return (
    <div className="mb-page">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.show}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ show: false, id: null })}
      />

      {/* Header */}
      <div className="mb-header">
        <div className="mb-header__text">
          <h1 className="mb-header__title">Membership Management</h1>
          <p className="mb-header__subtitle">Manage your membership plans and subscriptions</p>
        </div>
        <button
          className="mb-btn mb-btn--primary"
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', duration_time: '', status: 'active', price: '' });
            setIsModalOpen(true);
          }}
          disabled={isSubmitting}
        >
          + Add Membership
        </button>
      </div>

      {/* Stats */}
      <div className="mb-stats">
        <div className="mb-stats__card">
          <span className="mb-stats__icon">💎</span>
          <div>
            <h3 className="mb-stats__value">{memberships.length}</h3>
            <p className="mb-stats__label">Total Memberships</p>
          </div>
        </div>
        <div className="mb-stats__card">
          <span className="mb-stats__icon">✅</span>
          <div>
            <h3 className="mb-stats__value">
              {memberships.filter(m => m.status === 'active').length}
            </h3>
            <p className="mb-stats__label">Active Plans</p>
          </div>
        </div>
        <div className="mb-stats__card">
          <span className="mb-stats__icon">🚫</span>
          <div>
            <h3 className="mb-stats__value">
              {memberships.filter(m => m.status === 'inactive').length}
            </h3>
            <p className="mb-stats__label">Inactive Plans</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-table-section">
        <div className="mb-controls">
          <div className="mb-search">
            <span className="mb-search__icon">🔍</span>
            <input
              type="text"
              className="mb-search__input"
              placeholder="Search memberships..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
            />
          </div>
          <select
            className="mb-filter"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPagination(); }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Table columns={columns} data={paginatedMemberships} isLoading={isLoading} />

        {totalPages > 1 && (
          <div className="mb-pagination">
            <button
              className="mb-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="mb-pagination__numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`mb-pagination__num ${currentPage === page ? 'mb-pagination__num--active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="mb-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ name: '', duration_time: '', status: 'active', price: '' });
        }}
        title={editingId ? 'Edit Membership' : 'Add New Membership'}
      >
        <form onSubmit={handleSubmit} className="mb-form">
          <div className="mb-form__group">
            <label className="mb-form__label" htmlFor="planName">
              Plan Name <span className="mb-form__req">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`mb-form__input ${errors.name ? 'mb-form__input--error' : ''}`}
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Basic, Premium, Gold"
              disabled={isSubmitting}
            />
            {errors.name && <span className="mb-form__error">{errors.name}</span>}
          </div>

          <div className="mb-form__group">
            <label className="mb-form__label" htmlFor="duration">
              duration_time <span className="mb-form__req">*</span>
            </label>
            <input
              type="text"
              id="duration_time"
              name="duration_time"
              className={`mb-form__input ${errors.duration_time ? 'mb-form__input--error' : ''}`}
              value={formData.duration_time}
              onChange={handleInputChange}
              placeholder="e.g. 1 Month, 6 Months, 1 Year"
              disabled={isSubmitting}
            />
            {errors.duration_time && <span className="mb-form__error">{errors.duration_time}</span>}
          </div>

          <div className="mb-form__row">
            <div className="mb-form__group">
              <label className="mb-form__label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="mb-form__select"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="mb-form__group">
              <label className="mb-form__label" htmlFor="price">
                Price <span className="mb-form__req">*</span>
              </label>
              <input
                type="text"
                id="price"
                name="price"
                className={`mb-form__input ${errors.price ? 'mb-form__input--error' : ''}`}
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g. ₹499"
                disabled={isSubmitting}
              />
              {errors.price && <span className="mb-form__error">{errors.price}</span>}
            </div>
          </div>

          <div className="mb-form__actions">
            <button
              type="button"
              className="mb-btn mb-btn--ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ name: '', duration_time: '', status: 'active', price: '' });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mb-btn mb-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Membership' : 'Add Membership')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Memberships;