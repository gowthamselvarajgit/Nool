import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Button, Input, Select, Modal, Badge } from '../components/Common';
import Table from '../components/Table';
import { Plus, Edit2, Trash2, Package, AlertCircle, TrendingDown, TrendingUp, Download } from 'lucide-react';

export const InventoryManagementPage = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, showModalState] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    sku: '',
    category: 'SAREES', // SAREES, THREADS, BUTTONS, ZIPPERS, FABRIC
    quantity: '',
    minStock: '',
    unitPrice: '',
    supplier: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    categories: 0,
  });

  async function fetchInventory() {
    try {
      setLoading(true);
      // Simulated data - Replace with actual API call
      const mockInventory = [
        {
          id: 'INV001',
          itemName: 'Premium Sarees - Red',
          sku: 'SAR-RED-001',
          category: 'SAREES',
          quantity: 150,
          minStock: 50,
          unitPrice: 500,
          supplier: 'Supplier A',
          description: 'High quality red sarees',
          lastUpdated: '2026-05-10',
        },
        {
          id: 'INV002',
          itemName: 'Premium Sarees - Blue',
          sku: 'SAR-BLU-001',
          category: 'SAREES',
          quantity: 25,
          minStock: 50,
          unitPrice: 450,
          supplier: 'Supplier B',
          description: 'Premium blue sarees',
          lastUpdated: '2026-05-09',
        },
        {
          id: 'INV003',
          itemName: 'Silk Threads - Multicolor',
          sku: 'THD-MUL-001',
          category: 'THREADS',
          quantity: 500,
          minStock: 200,
          unitPrice: 50,
          supplier: 'Supplier C',
          description: 'Multicolor silk threads for polishing',
          lastUpdated: '2026-05-10',
        },
        {
          id: 'INV004',
          itemName: 'Decorative Buttons',
          sku: 'BUT-DEC-001',
          category: 'BUTTONS',
          quantity: 30,
          minStock: 100,
          unitPrice: 10,
          supplier: 'Supplier A',
          description: 'Decorative buttons for sarees',
          lastUpdated: '2026-05-08',
        },
        {
          id: 'INV005',
          itemName: 'Metal Zippers',
          sku: 'ZIP-MET-001',
          category: 'ZIPPERS',
          quantity: 200,
          minStock: 100,
          unitPrice: 25,
          supplier: 'Supplier D',
          description: 'High quality metal zippers',
          lastUpdated: '2026-05-10',
        },
        {
          id: 'INV006',
          itemName: 'Cotton Fabric - White',
          sku: 'FAB-CTN-WHT',
          category: 'FABRIC',
          quantity: 80,
          minStock: 100,
          unitPrice: 200,
          supplier: 'Supplier B',
          description: 'Premium cotton fabric',
          lastUpdated: '2026-05-09',
        },
      ];
      setInventory(mockInventory);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  function calculateStats() {
    const total = inventory.length;
    const value = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const lowStock = inventory.filter(item => item.quantity <= item.minStock).length;
    const uniqueCategories = new Set(inventory.map(item => item.category)).size;

    setStats({
      totalItems: total,
      totalValue: value,
      lowStockItems: lowStock,
      categories: uniqueCategories,
    });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [inventory]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      itemName: '',
      sku: '',
      category: 'SAREES',
      quantity: '',
      minStock: '',
      unitPrice: '',
      supplier: '',
      description: '',
    });
    showModalState(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity.toString(),
      minStock: item.minStock.toString(),
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier,
      description: item.description,
    });
    showModalState(true);
  };

  const handleDeleteClick = (item) => {
    setEditingItem(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setInventory(inventory.filter(item => item.id !== editingItem.id));
      setShowDeleteModal(false);
      setEditingItem(null);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    try {
      if (!formData.itemName || !formData.sku || !formData.quantity || !formData.unitPrice) {
        alert('Please fill all required fields');
        return;
      }

      setLoading(true);
      const newItem = {
        id: editingItem?.id || `INV${Date.now()}`,
        ...formData,
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        unitPrice: parseFloat(formData.unitPrice),
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      if (editingItem) {
        setInventory(inventory.map(item => item.id === editingItem.id ? newItem : item));
      } else {
        setInventory([newItem, ...inventory]);
      }

      showModalState(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving item:', error);
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

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= minStock) return { status: 'LOW', color: 'bg-red-100 text-red-800' };
    if (quantity <= minStock * 1.5) return { status: 'WARNING', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'OK', color: 'bg-green-100 text-green-800' };
  };

  const getCategoryLabel = (category) => {
    const labels = {
      SAREES: '👗 Sarees',
      THREADS: '🧵 Threads',
      BUTTONS: '🔘 Buttons',
      ZIPPERS: '🤐 Zippers',
      FABRIC: '📦 Fabric',
    };
    return labels[category] || category;
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const tableColumns = [
    {
      header: 'Item',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.itemName}</p>
          <p className="text-sm text-gray-600">{item.sku}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (item) => (
        <Badge className="bg-blue-100 text-blue-800">{getCategoryLabel(item.category)}</Badge>
      ),
    },
    {
      header: 'Quantity',
      render: (item) => {
        const stockStatus = getStockStatus(item.quantity, item.minStock);
        return (
          <div>
            <p className="font-semibold text-gray-900">{item.quantity}</p>
            <p className="text-sm text-gray-600">Min: {item.minStock}</p>
          </div>
        );
      },
    },
    {
      header: 'Stock Status',
      render: (item) => {
        const stockStatus = getStockStatus(item.quantity, item.minStock);
        return (
          <Badge className={stockStatus.color}>
            <span className="flex items-center">
              {stockStatus.status === 'LOW' && <AlertCircle className="w-3 h-3 mr-1" />}
              {stockStatus.status === 'WARNING' && <TrendingDown className="w-3 h-3 mr-1" />}
              {stockStatus.status === 'OK' && <TrendingUp className="w-3 h-3 mr-1" />}
              {stockStatus.status}
            </span>
          </Badge>
        );
      },
    },
    {
      header: 'Unit Price',
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">₹{item.unitPrice.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total: ₹{(item.quantity * item.unitPrice).toLocaleString()}</p>
        </div>
      ),
    },
    {
      header: 'Supplier',
      render: (item) => (
        <p className="text-gray-700">{item.supplier}</p>
      ),
    },
    {
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditItem(item)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
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
              <h1 className="text-4xl font-bold text-gray-900">📦 Inventory Management</h1>
              <p className="text-gray-600 mt-2">Track stock levels and manage inventory</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-green-600 mt-1">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Low Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.lowStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Categories</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.categories}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by item name or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1"
            />
            <Select
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'SAREES', label: '👗 Sarees' },
                { value: 'THREADS', label: '🧵 Threads' },
                { value: 'BUTTONS', label: '🔘 Buttons' },
                { value: 'ZIPPERS', label: '🤐 Zippers' },
                { value: 'FABRIC', label: '📦 Fabric' },
              ]}
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="md:w-48"
            />
            <Button onClick={handleAddItem} icon={Plus} className="bg-gradient-to-r from-blue-600 to-blue-700">
              Add Item
            </Button>
            <Button variant="outline" icon={Download}>
              Export
            </Button>
          </div>
        </Card>

        {/* Inventory Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          ) : paginatedInventory.length > 0 ? (
            <>
              <Table columns={tableColumns} data={paginatedInventory} />

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length}
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
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No inventory items found</p>
            </div>
          )}
        </Card>

        {/* Low Stock Alert */}
        {stats.lowStockItems > 0 && (
          <Card className="border-l-4 border-red-500 bg-red-50">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">⚠️ Low Stock Alert</p>
                <p className="text-red-700 text-sm">{stats.lowStockItems} items are below minimum stock level</p>
              </div>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                View Low Stock Items
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => showModalState(false)}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <Input
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="e.g., Premium Sarees"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <Input
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g., SAR-RED-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Item description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                options={[
                  { value: 'SAREES', label: '👗 Sarees' },
                  { value: 'THREADS', label: '🧵 Threads' },
                  { value: 'BUTTONS', label: '🔘 Buttons' },
                  { value: 'ZIPPERS', label: '🤐 Zippers' },
                  { value: 'FABRIC', label: '📦 Fabric' },
                ]}
                value={formData.category}
                onChange={(e) => handleInputChange({ target: { name: 'category', value: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <Input
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Supplier name"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
              <Input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ₹ *</label>
              <Input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveItem}
              loading={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
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
        title="Delete Inventory Item"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{editingItem?.itemName}</strong>?
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

export default InventoryManagementPage;
