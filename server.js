require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');

const app = express();

// --- 1. VIEW ENGINE SETUP (Keep .html extension) ---
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
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});
const upload = multer({ storage: storage });

// --- 5. MIDDLEWARE ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// --- 6. ROUTES ---

// Home Page
app.get('/', async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ _id: -1 });
        res.render('index.html', { notifs });
    } catch (err) {
        res.send("Error loading home page");
    }
});

// Admin Page (To add/delete news and photos)
app.get('/admin', async (req, res) => {
    const notifs = await Notification.find().sort({ _id: -1 });
    const photos = await Photo.find().sort({ createdAt: -1 });
    res.render('admin.html', { notifs, photos });
});

// Faculty Page
app.get('/faculty', (req, res) => {
    res.render('faculty.html');
});

// Union Gallery Page
app.get('/union-gallery', async (req, res) => {
    const photos = await Photo.find().sort({ createdAt: -1 });
    res.render('union-gallery.html', { photos });
});

// Admission Portal
app.get('/admission-portal', (req, res) => {
    res.render('admission-portal.html');
});

// --- ADMIN ACTIONS ---
app.post('/admin/add-notif', async (req, res) => {
    await Notification.create({ text: req.body.text });
    res.redirect('/admin');
});

app.post('/admin/upload', upload.single('image'), async (req, res) => {
    if (req.file) {
        await Photo.create({ title: req.body.title, url: req.file.path });
    }
    res.redirect('/admin');
});

app.post('/admin/delete/:type/:id', async (req, res) => {
    if (req.params.type === 'notif') {
        await Notification.findByIdAndDelete(req.params.id);
    } else {
        await Photo.findByIdAndDelete(req.params.id);
    }
    res.redirect('/admin');
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server live on http://localhost:${PORT}`);
});