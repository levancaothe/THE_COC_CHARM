const mongoose = require('mongoose');

const charmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a charm name'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
        default: 'no-photo.jpg'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be at least 0']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    description: {
        type: String,
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Please assign a category to this charm']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Charm', charmSchema);
