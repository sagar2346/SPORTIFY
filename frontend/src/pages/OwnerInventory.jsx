import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import { inventoryService } from '../services/api';
import toast from 'react-hot-toast';

const OwnerInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        sport: 'Football',
        condition: 'New'
    });

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getInventory();
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                quantity: parseInt(formData.quantity)
            };
            await inventoryService.addItem(dataToSend);
            toast.success('Item added successfully');
            setIsAddModalOpen(false);
            setFormData({ name: '', quantity: '', sport: 'Football', condition: 'New' });
            fetchInventory();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add item');
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                quantity: parseInt(formData.quantity)
            };
            await inventoryService.updateItem(currentItem._id, dataToSend);
            toast.success('Item updated successfully');
            setIsEditModalOpen(false);
            setCurrentItem(null);
            fetchInventory();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            try {
                await inventoryService.deleteItem(id);
                toast.success('Item deleted successfully');
                fetchInventory();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete item');
            }
        }
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setFormData({
            name: item.name,
            quantity: item.quantity,
            sport: item.sport,
            condition: item.condition
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage equipment availability for your venues.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', quantity: '', sport: 'Football', condition: 'New' });
                        setIsAddModalOpen(true);
                    }}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <FiPlus />
                    <span>Add Item</span>
                </button>
            </div>

            {/* Inventory List */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    Loading inventory...
                                </td>
                            </tr>
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {item.sport}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.condition}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    No items in inventory. Click "Add Item" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAddModalOpen(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleAddItem}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Item</h3>
                                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <FiX size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="input w-full mt-1"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sport</label>
                                            <select
                                                className="input w-full mt-1"
                                                value={formData.sport}
                                                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                            >
                                                <option value="Football">Football</option>
                                                <option value="Basketball">Basketball</option>
                                                <option value="Tennis">Tennis</option>
                                                <option value="Badminton">Badminton</option>
                                                <option value="Cricket">Cricket</option>
                                                <option value="Volleyball">Volleyball</option>
                                                <option value="Gym">Gym</option>
                                                <option value="Futsal">Futsal</option>
                                                <option value="Table Tennis">Table Tennis</option>
                                                <option value="Swimming">Swimming</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    className="input w-full mt-1"
                                                    value={formData.quantity}
                                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Condition</label>
                                                <select
                                                    className="input w-full mt-1"
                                                    value={formData.condition}
                                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                                >
                                                    <option value="New">New</option>
                                                    <option value="Excellent">Excellent</option>
                                                    <option value="Good">Good</option>
                                                    <option value="Fair">Fair</option>
                                                    <option value="Poor">Poor</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                        Add Item
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Item Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsEditModalOpen(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleEditItem}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Item</h3>
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <FiX size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="input w-full mt-1"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Sport</label>
                                            <select
                                                className="input w-full mt-1"
                                                value={formData.sport}
                                                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                                            >
                                                <option value="Football">Football</option>
                                                <option value="Basketball">Basketball</option>
                                                <option value="Tennis">Tennis</option>
                                                <option value="Badminton">Badminton</option>
                                                <option value="Cricket">Cricket</option>
                                                <option value="Volleyball">Volleyball</option>
                                                <option value="Gym">Gym</option>
                                                <option value="Futsal">Futsal</option>
                                                <option value="Table Tennis">Table Tennis</option>
                                                <option value="Swimming">Swimming</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    className="input w-full mt-1"
                                                    value={formData.quantity}
                                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Condition</label>
                                                <select
                                                    className="input w-full mt-1"
                                                    value={formData.condition}
                                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                                >
                                                    <option value="New">New</option>
                                                    <option value="Excellent">Excellent</option>
                                                    <option value="Good">Good</option>
                                                    <option value="Fair">Fair</option>
                                                    <option value="Poor">Poor</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerInventory;
