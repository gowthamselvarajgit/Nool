import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Select, Modal, Badge, Table } from '../components/Common';
import { Plus, Edit2, Trash2, Eye, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function DailyWorkManagementPage() {
  const [workRecords, setWorkRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, showModalState] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    workDate: selectedDate,
    taskName: '',
    description: '',
    hoursSpent: '',
    status: 'IN_PROGRESS',
    category: 'POLISHING', // POLISHING, SAREE_STITCHING, QUALITY_CHECK, PACKAGING
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalHours: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchWorkRecords();
    calculateStats();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      // Simulated data - Replace with actual API call
      const mockEmployees = [
        { id: 'EMP001', name: 'Rajesh Kumar', polishingRate: 50 },
        { id: 'EMP002', name: 'Priya Singh', polishingRate: 45 },
        { id: 'EMP003', name: 'Amit Patel', polishingRate: 55 },
        { id: 'EMP004', name: 'Neha Sharma', polishingRate: 48 },
        { id: 'EMP005', name: 'Vikram Gupta', polishingRate: 52 },
      ];
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchWorkRecords = async () => {
    try {
      setLoading(true);
      // Simulated data - Replace with actual API call
      const mockRecords = [
        {
          id: 'WORK001',
          employeeId: 'EMP001',
          employeeName: 'Rajesh Kumar',
          workDate: selectedDate,
          taskName: 'Polishing Work',
          description: 'Polished 50 sarees',
          hoursSpent: 8,
          status: 'COMPLETED',
          category: 'POLISHING',
          amount: 400,
        },
        {
          id: 'WORK002',
          employeeId: 'EMP002',
          employeeName: 'Priya Singh',
          workDate: selectedDate,
          taskName: 'Stitching Work',
          description: 'Stitched 30 sarees',
          hoursSpent: 7,
          status: 'IN_PROGRESS',
          category: 'SAREE_STITCHING',
          amount: 210,
        },
        {
          id: 'WORK003',
          employeeId: 'EMP003',
          employeeName: 'Amit Patel',
          workDate: selectedDate,
          taskName: 'Quality Check',
          description: 'Checked 80 sarees for quality',
          hoursSpent: 6,
          status: 'COMPLETED',
          category: 'QUALITY_CHECK',
          amount: 300,
        },
        {
          id: 'WORK004',
          employeeId: 'EMP004',
          employeeName: 'Neha Sharma',
          workDate: selectedDate,
          taskName: 'Packaging',
          description: 'Packaged 40 sarees',
          hoursSpent: 5,
          status: 'PENDING',
          category: 'PACKAGING',
          amount: 200,
        },
      ];
      setWorkRecords(mockRecords);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching work records:', error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = workRecords.length;
    const completed = workRecords.filter(r => r.status === 'COMPLETED').length;
    const inProgress = workRecords.filter(r => r.status === 'IN_PROGRESS').length;
    const hours = workRecords.reduce((sum, r) => sum + (r.hoursSpent || 0), 0);

    setStats({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      totalHours: hours,
    });
  };

  const handleAddWork = () => {
    setEditingRecord(null);
    setFormData({
      employeeId: '',
      workDate: selectedDate,
      taskName: '',
      description: '',
      hoursSpent: '',
      status: 'IN_PROGRESS',
      category: 'POLISHING',
    });
    showModalState(true);
  };

  const handleEditWork = (record) => {
    setEditingRecord(record);
    setFormData({
      employeeId: record.employeeId,
      workDate: record.workDate,
      taskName: record.taskName,
      description: record.description,
      hoursSpent: record.hoursSpent.toString(),
      status: record.status,
      category: record.category,
    });
    showModalState(true);
  };

  const handleDeleteClick = (record) => {
    setEditingRecord(record);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      // API call would go here
      // await workService.delete(editingRecord.id);
      setWorkRecords(workRecords.filter(r => r.id !== editingRecord.id));
      setShowDeleteModal(false);
      setEditingRecord(null);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      setLoading(false);
    }
  };

  const handleSaveWork = async () => {
    try {
      if (!formData.employeeId || !formData.taskName || !formData.hoursSpent) {
        alert('Please fill all required fields');
        return;
      }

      setLoading(true);
      // API call would go here
      // const result = editingRecord
      //   ? await workService.update(editingRecord.id, formData)
      //   : await workService.create(formData);

      const employee = employees.find(e => e.id === formData.employeeId);
      const newRecord = {
        id: editingRecord?.id || `WORK${Date.now()}`,
        employeeName: employee.name,
        ...formData,
        hoursSpent: parseInt(formData.hoursSpent),
      };

      if (editingRecord) {
        setWorkRecords(workRecords.map(r => r.id === editingRecord.id ? newRecord : r));
      } else {
        setWorkRecords([newRecord, ...workRecords]);
      }

      showModalState(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving work record:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'PENDING':
        return <AlertCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      POLISHING: '✨ Polishing',
      SAREE_STITCHING: '🧵 Stitching',
      QUALITY_CHECK: '✓ Quality Check',
      PACKAGING: '📦 Packaging',
    };
    return labels[category] || category;
  };

  // Filter records based on search
  const filteredRecords = workRecords.filter(record =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.taskName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const tableColumns = [
    {
      header: 'Employee',
      render: (record) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
            {record.employeeName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{record.employeeName}</p>
            <p className="text-sm text-gray-600">{record.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Task',
      render: (record) => (
        <div>
          <p className="font-medium text-gray-900">{record.taskName}</p>
          <p className="text-sm text-gray-600">{record.description}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (record) => (
        <Badge className="bg-blue-100 text-blue-800">{getCategoryLabel(record.category)}</Badge>
      ),
    },
    {
      header: 'Hours',
      render: (record) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900">{record.hoursSpent}h</span>
          <p className="text-sm text-gray-600">₹{record.amount}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (record) => (
        <Badge className={getStatusColor(record.status)}>
          <span className="flex items-center">
            {getStatusIcon(record.status)}
            {record.status}
          </span>
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (record) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditWork(record)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteClick(record)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="slide-down">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📅 Daily Work Management</h1>
              <p className="text-gray-600 mt-2">Track daily work activities and productivity</p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button onClick={handleAddWork} icon={Plus} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              Add Work Record
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.inProgressTasks}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Hours</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalHours}h</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <div className="flex gap-4">
            <Input
              placeholder="Search by employee name or task..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1"
            />
            <Button variant="outline" icon={Download}>
              Export
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading work records...</p>
            </div>
          ) : paginatedRecords.length > 0 ? (
            <>
              <Table columns={tableColumns} data={paginatedRecords} />

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No work records found for {selectedDate}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => showModalState(false)}
        title={editingRecord ? 'Edit Work Record' : 'Add Work Record'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <Select
                options={employees.map(e => ({ value: e.id, label: e.name }))}
                value={formData.employeeId}
                onChange={(e) => handleInputChange({ target: { name: 'employeeId', value: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Date *</label>
              <input
                type="date"
                name="workDate"
                value={formData.workDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
            <Input
              name="taskName"
              value={formData.taskName}
              onChange={handleInputChange}
              placeholder="e.g., Polishing Work"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the work done..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                options={[
                  { value: 'POLISHING', label: '✨ Polishing' },
                  { value: 'SAREE_STITCHING', label: '🧵 Stitching' },
                  { value: 'QUALITY_CHECK', label: '✓ Quality Check' },
                  { value: 'PACKAGING', label: '📦 Packaging' },
                ]}
                value={formData.category}
                onChange={(e) => handleInputChange({ target: { name: 'category', value: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Spent *</label>
              <Input
                type="number"
                name="hoursSpent"
                value={formData.hoursSpent}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                max="24"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              options={[
                { value: 'PENDING', label: '⏳ Pending' },
                { value: 'IN_PROGRESS', label: '⚙️ In Progress' },
                { value: 'COMPLETED', label: '✓ Completed' },
              ]}
              value={formData.status}
              onChange={(e) => handleInputChange({ target: { name: 'status', value: e.target.value } })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveWork}
              loading={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {editingRecord ? 'Update Record' : 'Add Record'}
            </Button>
            <Button
              variant="outline"
              onClick={() => showModalState(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Work Record"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-gray-700">
              Are you sure you want to delete this work record for <strong>{editingRecord?.employeeName}</strong>?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleDelete}
              loading={loading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
