import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { Toast, ConfirmModal } from '../components/Notification';
import '../css/Subjects.css';

const API_BASE_URL = 'http://localhost:3000/api/v1/add-subject';
const CLASSES_API_URL = 'http://localhost:3000/api/v1/add-class';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    classId: '',
    subjectsInput: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClassId, setFilterClassId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Notification States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_BASE_URL);
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setToast({ show: true, message: 'Failed to fetch subjects', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${CLASSES_API_URL}?status=active`);
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
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
    if (!formData.classId) newErrors.classId = 'Please select a class';
    if (!formData.subjectsInput.trim()) newErrors.subjectsInput = 'At least one subject is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const subjectsArray = formData.subjectsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');

      console.log('=== SUBMIT SUBJECT ===');
      console.log('subjectsArray:', subjectsArray);

      const payload = {
        class_id: parseInt(formData.classId),
        subject_name: subjectsArray,
        status: formData.status.toLowerCase()
      };

      console.log('payload:', payload);

      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, payload);
        setToast({ show: true, message: 'Subject updated successfully! ✅', type: 'success' });
      } else {
        await axios.post(API_BASE_URL, payload);
        setToast({ show: true, message: 'Subject created successfully! ✅', type: 'success' });
      }

      setFormData({ classId: '', subjectsInput: '', status: 'active' });
      setEditingId(null);
      setIsModalOpen(false);
      fetchSubjects();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setToast({ show: true, message: 'Failed to save subject: ' + errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (row) => {
    console.log('Editing row:', row);
    setEditingId(row.id);
    
    const subjectsString = Array.isArray(row.subject_name) 
      ? row.subject_name.join(', ') 
      : row.subject_name;

    setFormData({
      classId: String(row.class_id),
      subjectsInput: subjectsString,
      status: String(row.status || 'active').toLowerCase()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    const id = confirmModal.id;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setToast({ show: true, message: 'Subject deleted successfully! 🗑️', type: 'success' });
      fetchSubjects();
    } catch (error) {
      setToast({ show: true, message: 'Failed to delete subject', type: 'error' });
    } finally {
      setConfirmModal({ show: false, id: null });
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const subjectNameStr = Array.isArray(subject.subject_name) 
      ? subject.subject_name.join(' ') 
      : subject.subject_name;
    
    const matchesSearch = 
      subjectNameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.class_name && subject.class_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || subject.status === filterStatus;
    const matchesClass = filterClassId === 'all' || subject.class_id === parseInt(filterClassId);
    return matchesSearch && matchesFilter && matchesClass;
  });

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const resetPagination = () => setCurrentPage(1);

  const columns = [
    { key: 'class_name', label: 'Class' },
    {
      key: 'subject_name',
      label: 'Subject Name',
      render: (value) => {
        const displayValue = Array.isArray(value) 
          ? value.join(', ') 
          : value;
        return <span>{displayValue}</span>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusStr = String(value || 'active').toLowerCase().trim();
        const displayStatus = statusStr === '0' || statusStr === '1' 
          ? (statusStr === '0' ? 'active' : 'inactive')
          : statusStr;
        
        return (
          <span className={`sb-badge sb-badge--${displayStatus}`}>
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="sb-actions">
          <button className="sb-actions__edit" onClick={() => handleEdit(row)}>✏️</button>
          <button className="sb-actions__delete" onClick={() => setConfirmModal({ show: true, id: row.id })}>🗑️</button>
        </div>
      )
    }
  ];

  return (
    <div className="sb-page">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <ConfirmModal 
        isOpen={confirmModal.show} 
        onConfirm={handleDelete} 
        onCancel={() => setConfirmModal({ show: false, id: null })} 
      />
      <div className="sb-header">
        <div className="sb-header__text">
          <h1 className="sb-header__title">Subject Management</h1>
          <p className="sb-header__subtitle">Manage subjects and their associated classes</p>
        </div>
        <button 
          className="sb-btn sb-btn--primary" 
          onClick={() => {
            setEditingId(null);
            setFormData({ classId: '', subjectsInput: '', status: 'active' });
            setIsModalOpen(true);
          }}
          disabled={isSubmitting}
        >
          + Add Subject
        </button>
      </div>

      <div className="sb-stats">
        <div className="sb-stats__card">
          <span className="sb-stats__icon">📚</span>
          <div>
            <h3 className="sb-stats__value">{subjects.length}</h3>
            <p className="sb-stats__label">Total Subjects</p>
          </div>
        </div>
        <div className="sb-stats__card">
          <span className="sb-stats__icon">✅</span>
          <div>
            <h3 className="sb-stats__value">{subjects.filter(s => s.status === 'active').length}</h3>
            <p className="sb-stats__label">Active Subjects</p>
          </div>
        </div>
        <div className="sb-stats__card">
          <span className="sb-stats__icon">🏫</span>
          <div>
            <h3 className="sb-stats__value">{[...new Set(subjects.map(s => s.class_id))].length}</h3>
            <p className="sb-stats__label">Classes Covered</p>
          </div>
        </div>
      </div>

      <div className="sb-table-section">
        <div className="sb-controls">
          <div className="sb-search">
            <span className="sb-search__icon">🔍</span>
            <input
              type="text"
              className="sb-search__input"
              placeholder="Search subjects or classes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
            />
          </div>
          <select
            className="sb-filter"
            value={filterClassId}
            onChange={(e) => { setFilterClassId(e.target.value); resetPagination(); }}
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.class_name}</option>
            ))}
          </select>
          <select
            className="sb-filter"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPagination(); }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Table columns={columns} data={paginatedSubjects} isLoading={isLoading} />

        {totalPages > 1 && (
          <div className="sb-pagination">
            <button
              className="sb-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="sb-pagination__numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`sb-pagination__num ${currentPage === page ? 'sb-pagination__num--active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="sb-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({ classId: '', subjectsInput: '', status: 'active' });
        }} 
        title={editingId ? "Edit Subject" : "Add New Subject"}
      >
        <form onSubmit={handleSubmit} className="sb-form">
          <div className="sb-form__group">
            <label className="sb-form__label" htmlFor="classId">
              Select Class <span className="sb-form__req">*</span>
            </label>
            <select
              id="classId"
              name="classId"
              className={`sb-form__select ${errors.classId ? 'sb-form__select--error' : ''}`}
              value={formData.classId}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
            {errors.classId && <span className="sb-form__error">{errors.classId}</span>}
          </div>

          <div className="sb-form__group">
            <label className="sb-form__label" htmlFor="subjectsInput">
              Subject Name <span className="sb-form__req">*</span>
            </label>
            <input
              type="text"
              id="subjectsInput"
              name="subjectsInput"
              className={`sb-form__input ${errors.subjectsInput ? 'sb-form__input--error' : ''}`}
              value={formData.subjectsInput}
              onChange={handleInputChange}
              placeholder="e.g. Maths, Science, English"
              disabled={isSubmitting}
            />
            {errors.subjectsInput && <span className="sb-form__error">{errors.subjectsInput}</span>}
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
              💡 Add multiple subjects separated by commas
            </small>
          </div>

          <div className="sb-form__group">
            <label className="sb-form__label" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="sb-form__select"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="sb-form__actions">
            <button 
              type="button" 
              className="sb-btn sb-btn--ghost" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ classId: '', subjectsInput: '', status: 'active' });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="sb-btn sb-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Subject' : 'Add Subject')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;