const mongoose = require('mongoose');

const braceletDesignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for your design'],
        trim: true,
        default: 'My Unique Bracelet'
    },
    charms: [
        {
            charm: {
                type: mongoose.Schema.ObjectId,
                ref: 'Charm',
                required: true
            },
            x: { type: Number, required: true },
            y: { type: Number, required: true }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    isSaved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BraceletDesign', braceletDesignSchema);
