import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/apiClient';
import { Users as UsersIcon, Search, Plus, Edit, Trash2, Shield, Mail, Phone } from 'lucide-react';
import UserForm from '../components/UserForm';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ ...filters });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await usersAPI.create(userData);
      setShowCreateModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await usersAPI.update(selectedUser._id, userData);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const handleDeleteUser = async () => {
    try {
      await usersAPI.delete(selectedUser._id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const openEditModal = (usr) => {
    setSelectedUser(usr);
    setShowEditModal(true);
  };

  const openDeleteDialog = (usr) => {
    setSelectedUser(usr);
    setShowDeleteDialog(true);
  };

  const canManageUsers = user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManageUsers && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Role
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="clerk">Clerk</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-3">Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {usr.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{usr.name}</div>
                          <div className="text-xs text-gray-500">{usr.username || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{usr.email}</span>
                        </div>
                        {usr.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{usr.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${getRoleColor(usr.role)}`} />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getRoleBadge(usr.role)}`}>
                          {usr.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {usr.last_login ? new Date(usr.last_login).toLocaleDateString() : 'Never'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {usr.last_login ? new Date(usr.last_login).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usr.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {usr.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {canManageUsers && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(usr)}
                            className="p-1.5 text-primary hover:bg-primary-50 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(usr)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-sm text-gray-500">
              No users match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <UserForm
                onSubmit={handleCreateUser}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <UserForm
                initialData={selectedUser}
                onSubmit={handleEditUser}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

function getRoleColor(role) {
  const colors = {
    admin: 'text-red-600',
    manager: 'text-blue-600',
    clerk: 'text-green-600',
    buyer: 'text-purple-600'
  };
  return colors[role] || 'text-gray-600';
}

function getRoleBadge(role) {
  const badges = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    clerk: 'bg-green-100 text-green-700',
    buyer: 'bg-purple-100 text-purple-700'
  };
  return badges[role] || 'bg-gray-100 text-gray-700';
}
