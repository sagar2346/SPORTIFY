import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import { inventoryService } from '../services/api';
import toast from 'react-hot-toast';

const OwnerInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
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

    const handleDeleteItem = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await inventoryService.deleteItem(itemToDelete);
            toast.success('Item deleted successfully');
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchInventory();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete item');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500 mt-2">Manage your venue's equipment and stock.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', quantity: '', sport: 'Football', condition: 'New' });
                        setIsAddModalOpen(true);
                    }}
                    className="btn btn-primary flex items-center space-x-2 px-6 py-2"
                >
                    <FiPlus />
                    <span>Add Item</span>
                </button>
            </div>

            {/* Inventory List */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden p-0">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                            <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <p className="text-gray-500 font-medium">Loading Inventory...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <div className="text-base font-semibold text-gray-900">{item.name}</div>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs font-medium rounded-full bg-primary-50 text-primary-700">
                                            {item.sport}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`text-base font-medium ${item.quantity < 5 ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</span>
                                            <span className="ml-2 text-xs text-gray-400">Units</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${item.condition === 'New' || item.condition === 'Excellent'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-amber-50 text-amber-700'
                                            }`}>
                                            {item.condition}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <p className="text-gray-500 font-medium">No items in inventory.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-lg border border-gray-100 relative z-10 animate-slide-up">
                        <form onSubmit={handleAddItem}>
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Add New Item</h3>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-xl transition-all">
                                        <FiX size={24} />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="input w-full font-bold"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Professional Football Series A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sport Category</label>
                                        <select
                                            className="input w-full font-bold"
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
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                className="input w-full font-bold"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Physical Condition</label>
                                            <select
                                                className="input w-full font-bold"
                                                value={formData.condition}
                                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                            >
                                                <option value="New">Brand New</option>
                                                <option value="Excellent">Excellent</option>
                                                <option value="Good">Operational</option>
                                                <option value="Fair">Fair</option>
                                                <option value="Poor">Needs Service</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-8 flex flex-row-reverse gap-4">
                                <button type="submit" className="btn btn-primary px-6 py-2">
                                    Add Item
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Item Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-lg border border-gray-100 relative z-10 animate-slide-up">
                        <form onSubmit={handleEditItem}>
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Edit Item</h3>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-xl transition-all">
                                        <FiX size={24} />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Item Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="input w-full font-bold"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sport Category</label>
                                        <select
                                            className="input w-full font-bold"
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
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                className="input w-full font-bold"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Physical Condition</label>
                                            <select
                                                className="input w-full font-bold"
                                                value={formData.condition}
                                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                            >
                                                <option value="New">Brand New</option>
                                                <option value="Excellent">Excellent</option>
                                                <option value="Good">Operational</option>
                                                <option value="Fair">Fair</option>
                                                <option value="Poor">Needs Service</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-8 flex flex-row-reverse gap-4">
                                <button type="submit" className="btn btn-primary px-6 py-2">
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl transform transition-all w-full max-w-md border border-gray-100 relative z-10 animate-slide-up text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiTrash2 size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-black">Delete Item?</h3>
                        <p className="text-gray-500 mb-10 leading-relaxed font-bold text-xs uppercase tracking-widest">Are you sure you want to remove this item? This action cannot be undone.</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmDelete}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-500/20 active:scale-[0.98]"
                            >
                                Confirm Delete
                            </button>
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="w-full py-4 bg-white hover:bg-gray-50 text-gray-400 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
                            >
                                Stay Safe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerInventory;
