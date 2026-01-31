require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');

const app = express();

// --- 1. VIEW ENGINE SETUP ---
// We use EJS but keep the .html extension for your files
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err.message));

// --- 3. MODELS ---
const Notification = mongoose.model('Notification', new mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now }
}));

const Photo = mongoose.model('Photo', new mongoose.Schema({
    title: String,
    url: String,
    createdAt: { type: Date, default: Date.now }
}));

// --- 4. CLOUDINARY CONFIG ---
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET 
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'darul_arqam_portal',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});
const upload = multer({ storage: storage });

// --- 5. MIDDLEWARE ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- 6. ROUTES ---

// Home Page
app.get('/', async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ _id: -1 });
        res.render('index.html', { notifs });
    } catch (err) {
        res.status(500).send("Error loading home page");
    }
});

// Admin Page (Manage notifications and gallery uploads)
app.get('/admin', async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ _id: -1 });
        const photos = await Photo.find().sort({ createdAt: -1 });
        res.render('admin.html', { notifs, photos });
    } catch (err) {
        res.status(500).send("Error loading Admin panel");
    }
});

// Union Gallery Page (Public View)
app.get('/union-gallery', async (req, res) => {
    try {
        // Fetch all photos stored in MongoDB
        const photos = await Photo.find().sort({ createdAt: -1 });
        res.render('union-gallery.html', { photos });
    } catch (err) {
        res.status(500).send("Error loading gallery");
    }
});

// Other Static Pages
app.get('/faculty', (req, res) => res.render('faculty.html'));
app.get('/admission-portal', (req, res) => res.render('admission-portal.html'));

// --- ADMIN ACTIONS ---

// Add News/Notification
app.post('/admin/add-notif', async (req, res) => {
    if (req.body.text) {
        await Notification.create({ text: req.body.text });
    }
    res.redirect('/admin');
});

// Upload Photo to Cloudinary and save link to MongoDB
app.post('/admin/upload', upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            await Photo.create({ 
                title: req.body.title || 'Gallery Image', 
                url: req.file.path // This is the Cloudinary URL
            });
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Upload failed: " + err.message);
    }
});

// Delete Notification or Photo
app.post('/admin/delete/:type/:id', async (req, res) => {
    try {
        if (req.params.type === 'notif') {
            await Notification.findByIdAndDelete(req.params.id);
        } else if (req.params.type === 'photo') {
            await Photo.findByIdAndDelete(req.params.id);
        }
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Delete failed");
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server live on http://localhost:${PORT}`);
});
