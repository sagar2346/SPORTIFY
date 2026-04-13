import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';
import ConfirmModal from '../components/common/ConfirmModal';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await adminService.getUsers();
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveOwner = async (userId) => {
        try {
            await adminService.approveVenueOwner(userId);
            toast.success('Owner approved successfully');
            loadUsers(); // Reload list
        } catch (error) {
            console.error('Error approving owner:', error);
            toast.error('Failed to approve owner');
        }
    };

    const handleDeleteUser = (id) => {
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await adminService.deleteUser(userToDelete);
            toast.success('User deleted successfully');
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete));
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await adminService.updateUserStatus(id, status);
            toast.success(`User status updated to ${status}`);
            loadUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 text-black shadow-none border-none">User Management</h1>

            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'venue_owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.status || 'pending'}
                                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                                        className={`text-sm rounded-full px-2 py-1 border-none focus:ring-0 cursor-pointer transition-colors
                                         ${user.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    user.status === 'blocked' ? 'bg-gray-800 text-white' :
                                                        'bg-red-100 text-red-800'}`}
                                    >
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                        <option value="modified">Modified</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {user._id !== currentUser._id ? (
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="text-red-600 hover:text-red-900 flex items-center"
                                            title="Delete User"
                                        >
                                            <FiX className="mr-1" /> Delete
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Current User</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone and will remove all their data from the system."
                confirmText="Delete User"
                type="danger"
            />
        </div>
    );
};

export default UserManagement;
