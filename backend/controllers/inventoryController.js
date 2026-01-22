const Inventory = require('../models/Inventory');

// @desc    Get all inventory items for a venue owner
// @route   GET /api/inventory
// @access  Private (Venue Owner)
exports.getInventory = async (req, res) => {
    try {
        const items = await Inventory.find({ owner: req.user.id }).sort({ lastUpdated: -1 });
        res.status(200).json({
            success: true,
            count: items.length,
            data: items,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private (Venue Owner)
exports.addItem = async (req, res) => {
    try {
        req.body.owner = req.user.id;

        const item = await Inventory.create(req.body);

        res.status(201).json({
            success: true,
            data: item,
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Venue Owner)
exports.updateItem = async (req, res) => {
    try {
        let item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        // Make sure user owns the item
        if (item.owner.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this item',
            });
        }

        item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: item,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Venue Owner)
exports.deleteItem = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        // Make sure user owns the item
        if (item.owner.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this item',
            });
        }

        await item.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};
