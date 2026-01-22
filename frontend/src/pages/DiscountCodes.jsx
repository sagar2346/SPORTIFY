import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTag, FiPercent, FiDollarSign } from 'react-icons/fi';

const DiscountCodes = () => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newCode, setNewCode] = useState({
        code: '',
        type: 'percentage',
        value: '',
        minPurchase: '',
        maxDiscount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
    });

    useEffect(() => {
        loadCodes();
    }, []);

    const loadCodes = async () => {
        try {
            const response = await adminService.getDiscountCodes();
            setCodes(response.data.data);
        } catch (error) {
            console.error('Error loading discount codes:', error);
            toast.error('Failed to load discount codes');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewCode({
            ...newCode,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newCode,
                value: Number(newCode.value),
                minPurchase: Number(newCode.minPurchase) || 0,
                maxDiscount: newCode.maxDiscount ? Number(newCode.maxDiscount) : undefined,
                usageLimit: newCode.usageLimit ? Number(newCode.usageLimit) : undefined,
            };

            await adminService.createDiscountCode(payload);
            toast.success('Discount code created successfully');
            setShowForm(false);
            setNewCode({
                code: '',
                type: 'percentage',
                value: '',
                minPurchase: '',
                maxDiscount: '',
                validFrom: '',
                validUntil: '',
                usageLimit: '',
            });
            loadCodes();
        } catch (error) {
            console.error('Error creating discount code:', error);
            toast.error(error.response?.data?.message || 'Failed to create discount code');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center">
                    <FiTag className="mr-3" />
                    Discount Codes
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary flex items-center"
                >
                    <FiPlus className="mr-2" />
                    Create New Code
                </button>
            </div>

            {showForm && (
                <div className="card mb-8 animate-fade-in-down">
                    <h2 className="text-xl font-bold mb-4">New Discount Code</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                            <input
                                type="text"
                                name="code"
                                value={newCode.code}
                                onChange={handleInputChange}
                                className="input uppercase"
                                placeholder="e.g. SUMMER2024"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                name="type"
                                value={newCode.type}
                                onChange={handleInputChange}
                                className="input"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                            <input
                                type="number"
                                name="value"
                                value={newCode.value}
                                onChange={handleInputChange}
                                className="input"
                                placeholder={newCode.type === 'percentage' ? 'Percentage (e.g. 10)' : 'Amount (e.g. 50)'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Purchase (Rs.)</label>
                            <input
                                type="number"
                                name="minPurchase"
                                value={newCode.minPurchase}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="0"
                            />
                        </div>
                        {newCode.type === 'percentage' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (Rs.)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={newCode.maxDiscount}
                                    onChange={handleInputChange}
                                    className="input"
                                    placeholder="Optional"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={newCode.usageLimit}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                            <input
                                type="date"
                                name="validFrom"
                                value={newCode.validFrom}
                                onChange={handleInputChange}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                            <input
                                type="date"
                                name="validUntil"
                                value={newCode.validUntil}
                                onChange={handleInputChange}
                                className="input"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Create Code
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {codes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No discount codes found.
                                </td>
                            </tr>
                        ) : (
                            codes.map((code) => (
                                <tr key={code._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-bold text-primary-600">{code.code}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {code.type === 'percentage' ? <FiPercent className="mr-1" /> : <FiDollarSign className="mr-1" />}
                                            {code.value}{code.type === 'percentage' ? '%' : ''}
                                            {code.minPurchase > 0 && <span className="text-xs text-gray-500 ml-2">(Min: Rs. {code.minPurchase})</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(code.validFrom).toLocaleDateString()} - {new Date(code.validUntil).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {code.usedCount} / {code.usageLimit || '∞'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${params(code) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {params(code) ? 'Active' : 'Expired'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const params = (code) => {
    const now = new Date();
    const validUntil = new Date(code.validUntil);
    return code.isActive && validUntil >= now;
}

export default DiscountCodes;
