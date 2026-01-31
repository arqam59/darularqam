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

// Model for Site Settings (Backgrounds, Branding Photos)
const Setting = mongoose.model('Setting', new mongoose.Schema({
    key: { type: String, unique: true }, // e.g., 'main_bg', 'union_hero'
    url: String
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
        // Fetch settings to get custom backgrounds
        const settingsList = await Setting.find();
        const settings = {};
        settingsList.forEach(s => settings[s.key] = s.url);
        
        res.render('index.html', { notifs, settings });
    } catch (err) {
        res.status(500).send("Error loading home page");
    }
});

// Admin Page
app.get('/admin', async (req, res) => {
    try {
        const notifs = await Notification.find().sort({ _id: -1 });
        const photos = await Photo.find().sort({ createdAt: -1 });
        const settingsList = await Setting.find();
        const settings = {};
        settingsList.forEach(s => settings[s.key] = s.url);

        res.render('admin.html', { notifs, photos, settings });
    } catch (err) {
        res.status(500).send("Error loading Admin panel");
    }
});

// Union Gallery Page
app.get('/union-gallery', async (req, res) => {
    try {
        const photos = await Photo.find().sort({ createdAt: -1 });
        const settings = await Setting.findOne({ key: 'union_hero' });
        res.render('union-gallery.html', { photos, hero: settings ? settings.url : '/bg2.png' });
    } catch (err) {
        res.status(500).send("Error loading gallery");
    }
});

// Static Pages
app.get('/faculty', async (req, res) => {
    const settings = await Setting.findOne({ key: 'faculty_header' });
    res.render('faculty.html', { headerImg: settings ? settings.url : '/default-header.jpg' });
});
app.get('/admission-portal', (req, res) => res.render('admission-portal.html'));

// --- ADMIN ACTIONS ---

app.post('/admin/add-notif', async (req, res) => {
    if (req.body.text) await Notification.create({ text: req.body.text });
    res.redirect('/admin');
});

// Regular Gallery Upload
app.post('/admin/upload', upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            await Photo.create({ 
                title: req.body.title || 'Gallery Image', 
                url: req.file.path 
            });
        }
        res.redirect('/admin');
    } catch (err) { res.status(500).send("Upload failed"); }
});

// Special Background/Visual Upload
app.post('/admin/upload-special', upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            await Setting.findOneAndUpdate(
                { key: req.body.target }, 
                { url: req.file.path }, 
                { upsert: true }
            );
        }
        res.redirect('/admin');
    } catch (err) { res.status(500).send("Update failed"); }
});

app.post('/admin/delete/:type/:id', async (req, res) => {
    try {
        if (req.params.type === 'notif') {
            await Notification.findByIdAndDelete(req.params.id);
        } else if (req.params.type === 'photo') {
            await Photo.findByIdAndDelete(req.params.id);
        }
        res.redirect('/admin');
    } catch (err) { res.status(500).send("Delete failed"); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server live on http://localhost:${PORT}`));
