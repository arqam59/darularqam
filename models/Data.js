const mongoose = require('mongoose');

// Schema for the News Ticker and Notifications
const NotificationSchema = new mongoose.Schema({
    text: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

// Schema for the Union Gallery Images
const PhotoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }, // The link from Cloudinary
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', NotificationSchema);
const Photo = mongoose.model('Photo', PhotoSchema);

// Exporting both so server.js can use them
module.exports = { Notification, Photo };