import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { Toast, ConfirmModal } from '../components/Notification';
import '../css/Classes.css';

const API_BASE_URL = 'http://localhost:3000/api/v1/add-class';

// Helper: create axios instance with token
const createClassApi = () => {
  const token = localStorage.getItem('adminToken');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    className: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Notification States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  // FETCH ALL DATA
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const api = createClassApi();
      const response = await api.get('/');
      if (response.data.success) {
        const mappedData = response.data.data.map(item => ({
          id: item.id,
          className: item.class_name || item.className,
          status: String(item.status || 'active').toLowerCase().trim()
        }));
        setClasses(mappedData);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setToast({ show: true, message: 'Failed to fetch classes', type: 'error' });
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
    if (!formData.className.trim()) newErrors.className = 'Class name is required';
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
      const api = createClassApi();
      const payload = {
        class_name: formData.className,
        status: formData.status.toLowerCase()
      };

      if (editingId) {
        await api.put(`/${editingId}`, payload);
        setToast({ show: true, message: 'Class updated successfully! ✅', type: 'success' });
      } else {
        await api.post('/', payload);
        setToast({ show: true, message: 'Class created successfully! ✅', type: 'success' });
      }

      setFormData({ className: '', status: 'active' });
      setEditingId(null);
      setIsModalOpen(false);
      fetchClasses();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setToast({ show: true, message: 'Failed to save class: ' + errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // PREPARE EDIT
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      className: row.className,
      status: String(row.status || 'active').toLowerCase()
    });
    setIsModalOpen(true);
  };

  // DELETE
  const handleDelete = async () => {
    const id = confirmModal.id;
    try {
      const api = createClassApi();
      await api.delete(`/${id}`);
      setToast({ show: true, message: 'Class deleted successfully! 🗑️', type: 'success' });
      fetchClasses();
    } catch (error) {
      setToast({ show: true, message: 'Failed to delete class', type: 'error' });
    } finally {
      setConfirmModal({ show: false, id: null });
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cls.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const resetPagination = () => setCurrentPage(1);

  const columns = [
    { key: 'className', label: 'Class Name' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusStr = String(value || 'active').toLowerCase().trim();
        const displayStatus = statusStr === '0' || statusStr === '1' 
          ? (statusStr === '0' ? 'active' : 'inactive')
          : statusStr;
        
        return (
          <span className={`cl-badge cl-badge--${displayStatus}`}>
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="cl-actions">
          <button className="cl-actions__edit" onClick={() => handleEdit(row)}>✏️</button>
          <button className="cl-actions__delete" onClick={() => setConfirmModal({ show: true, id: row.id })}>🗑️</button>
        </div>
      )
    }
  ];

  return (
    <div className="cl-page">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <ConfirmModal 
        isOpen={confirmModal.show} 
        onConfirm={handleDelete} 
        onCancel={() => setConfirmModal({ show: false, id: null })} 
      />
      {/* Header */}
      <div className="cl-header">
        <div className="cl-header__text">
          <h1 className="cl-header__title">Class Management</h1>
          <p className="cl-header__subtitle">Manage your course classes and categories</p>
        </div>
        <button 
          className="cl-btn cl-btn--primary" 
          onClick={() => {
            setEditingId(null);
            setFormData({ className: '', status: 'active' });
            setIsModalOpen(true);
          }}
          disabled={isSubmitting}
        >
          + Add Class
        </button>
      </div>

      {/* Stats */}
      <div className="cl-stats">
        <div className="cl-stats__card">
          <span className="cl-stats__icon">🏫</span>
          <div>
            <h3 className="cl-stats__value">{classes.length}</h3>
            <p className="cl-stats__label">Total Classes</p>
          </div>
        </div>
        <div className="cl-stats__card">
          <span className="cl-stats__icon">✅</span>
          <div>
            <h3 className="cl-stats__value">{classes.filter(c => c.status === 'active').length}</h3>
            <p className="cl-stats__label">Active Classes</p>
          </div>
        </div>
        <div className="cl-stats__card">
          <span className="cl-stats__icon">🚫</span>
          <div>
            <h3 className="cl-stats__value">{classes.filter(c => c.status === 'inactive').length}</h3>
            <p className="cl-stats__label">Inactive Classes</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="cl-table-section">
        <div className="cl-controls">
          <div className="cl-search">
            <span className="cl-search__icon">🔍</span>
            <input
              type="text"
              className="cl-search__input"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
            />
          </div>
          <select
            className="cl-filter"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPagination(); }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Table columns={columns} data={paginatedClasses} isLoading={isLoading} />

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
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ className: '', status: 'active' });
        }} 
        title={editingId ? "Edit Class" : "Add New Class"}
      >
        <form onSubmit={handleSubmit} className="cl-form">
          <div className="cl-form__group">
            <label className="cl-form__label" htmlFor="className">
              Class Name <span className="cl-form__req">*</span>
            </label>
            <input
              type="text"
              id="className"
              name="className"
              className={`cl-form__input ${errors.className ? 'cl-form__input--error' : ''}`}
              value={formData.className}
              onChange={handleInputChange}
              placeholder="e.g. Mathematics 101"
              disabled={isSubmitting}
            />
            {errors.className && <span className="cl-form__error">{errors.className}</span>}
          </div>

          <div className="cl-form__group">
            <label className="cl-form__label" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="cl-form__select"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="cl-form__actions">
            <button 
              type="button" 
              className="cl-btn cl-btn--ghost" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ className: '', status: 'active' });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="cl-btn cl-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Class' : 'Add Class')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Classes;