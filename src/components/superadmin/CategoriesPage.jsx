import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Download, Tag, Plus, Edit, Trash2,
  Eye, ChevronRight, Folder, FileText
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(data.categories || data.data || []);
    } catch (error) {
      setCategories([
        { _id: '1', name: 'Technology', description: 'Software, IT, and tech-related jobs', icon: 'laptop', jobsCount: 125, isActive: true },
        { _id: '2', name: 'Healthcare', description: 'Medical and healthcare positions', icon: 'heart', jobsCount: 89, isActive: true },
        { _id: '3', name: 'Finance', description: 'Banking, accounting, and finance', icon: 'dollar', jobsCount: 67, isActive: true },
        { _id: '4', name: 'Marketing', description: 'Marketing and sales positions', icon: 'trending-up', jobsCount: 54, isActive: true },
        { _id: '5', name: 'Education', description: 'Teaching and education roles', icon: 'book', jobsCount: 42, isActive: true },
        { _id: '6', name: 'Engineering', description: 'Engineering and manufacturing', icon: 'settings', jobsCount: 38, isActive: true },
        { _id: '7', name: 'Design', description: 'Creative and design positions', icon: 'palette', jobsCount: 31, isActive: false },
        { _id: '8', name: 'HR', description: 'Human resources and recruitment', icon: 'users', jobsCount: 25, isActive: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategory)
      });
      setNewCategory({ name: '', description: '', icon: '' });
      setShowCreateModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
          <button
            onClick={fetchCategories}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{categories.length}</h3>
          <p className="text-gray-500 text-sm">Total Categories</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{categories.filter(c => c.isActive).length}</h3>
          <p className="text-gray-500 text-sm">Active Categories</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Folder className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{categories.reduce((sum, c) => sum + (c.jobsCount || 0), 0)}</h3>
          <p className="text-gray-500 text-sm">Total Jobs in Categories</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className={`p-4 rounded-lg border ${category.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Tag className={`w-5 h-5 ${category.isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">{category.jobsCount || 0} jobs</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(category)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(category._id)}
                    className={`p-1.5 rounded ${category.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                    title={category.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {category.isActive ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No categories found</p>
          </div>
        )}
      </div>

      {showModal && selectedCategory && (
        <DetailModal
          title="Category Details"
          data={selectedCategory}
          onClose={() => setShowModal(false)}
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Icon name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;