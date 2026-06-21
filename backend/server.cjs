require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { Resend } = require('resend');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tswheels';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas & Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);

const vehicleSchema = new mongoose.Schema({
  name: String,
  type: String,
  brand: String,
  model: String,
  year: Number,
  images: [String],
  price: { hourly: Number, daily: Number, weekly: Number },
  specifications: mongoose.Schema.Types.Mixed,
  availability: Boolean,
  rating: Number,
  reviews: Number
});
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

const bookingSchema = new mongoose.Schema({
  userId: String,
  vehicleId: String,
  vehicleName: String,
  startDate: String,
  endDate: String,
  totalPrice: String,
  status: String,
  paymentMethod: String,
  transactionId: String,
  createdAt: String
});
const Booking = mongoose.model('Booking', bookingSchema);

const adSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  color: String,
  link: String
});
const Ad = mongoose.model('Ad', adSchema);

const settingsSchema = new mongoose.Schema({
  id: String,
  system_name: String,
  contact_email: String,
  tax_rate: Number,
  security_deposit: Number,
  terms_and_conditions: String,
  maintenance_mode: Boolean
});
const Settings = mongoose.model('Settings', settingsSchema);

// Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_hnWedhMu_Dw6KTiw8qiXXmKQN7FByugvq');

// --- Auth Routes ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password }).lean();
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({
      user: { ...userWithoutPassword, id: user._id.toString() },
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
    });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }
  const user = await User.create({ email, password, name, role: 'user' });
  const userObj = user.toObject();
  delete userObj.password;
  userObj.id = userObj._id.toString();
  res.json({ user: userObj, token: 'mock-jwt-token-' + Math.random().toString(36) });
});

// --- API Routes (CRUD Replacements for json-server) ---
const handleGet = (Model) => async (req, res) => {
  const data = await Model.find().lean();
  res.json(data.map(d => ({ ...d, id: d._id.toString() })));
};

app.get('/vehicles', handleGet(Vehicle));
app.get('/vehicles/:id', async (req, res) => {
  const v = await Vehicle.findById(req.params.id).lean();
  v ? res.json({ ...v, id: v._id.toString() }) : res.status(404).send();
});
app.post('/vehicles', async (req, res) => {
  const v = await Vehicle.create(req.body);
  res.json({ ...v.toObject(), id: v._id.toString() });
});
app.put('/vehicles/:id', async (req, res) => {
  const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {new: true}).lean();
  res.json({ ...v, id: v._id.toString() });
});
app.patch('/vehicles/:id', async (req, res) => {
  const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {new: true}).lean();
  res.json({ ...v, id: v._id.toString() });
});
app.delete('/vehicles/:id', async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.status(200).send();
});

app.get('/bookings', handleGet(Booking));
app.get('/bookings/:id', async (req, res) => {
  const b = await Booking.findById(req.params.id).lean();
  b ? res.json({ ...b, id: b._id.toString() }) : res.status(404).send();
});
app.post('/bookings', async (req, res) => {
  // Try to keep original id logic if client sends it, otherwise mongo generated
  const b = await Booking.create(req.body);
  res.json({ ...b.toObject(), id: b.id || b._id.toString() });
});
app.patch('/bookings/:id', async (req, res) => {
  const b = await Booking.findOneAndUpdate({id: req.params.id}, req.body, {new: true}).lean();
  if(b) return res.json({ ...b, id: b.id });
  // fallback if using _id
  const b2 = await Booking.findByIdAndUpdate(req.params.id, req.body, {new: true}).lean();
  res.json({ ...b2, id: b2._id.toString() });
});

app.get('/users', handleGet(User));
app.get('/ads', handleGet(Ad));

app.get('/settings', async (req, res) => {
  const s = await Settings.findOne({id: 'global'}).lean();
  if (s) { res.json([s]); } else { res.json([]); }
});
app.put('/settings', async (req, res) => {
  const s = await Settings.findOneAndUpdate({id: 'global'}, req.body, {upsert: true, new: true}).lean();
  res.json(s);
});

// --- Easebuzz Routes ---
app.post('/api/easebuzz/initiate', async (req, res) => {
  const { txnid, amount, productinfo, firstname, email, phone, udf1, udf2, udf3, udf4, udf5 } = req.body;
  const key = process.env.EASEBUZZ_KEY || '2JRJU40RU';
  const salt = process.env.EASEBUZZ_SALT || '3UW7CPPBT';

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1 || ''}|${udf2 || ''}|${udf3 || ''}|${udf4 || ''}|${udf5 || ''}||||||${salt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const formData = new URLSearchParams();
  formData.append('key', key);
  formData.append('txnid', txnid);
  formData.append('amount', amount);
  formData.append('productinfo', productinfo);
  formData.append('firstname', firstname);
  formData.append('phone', phone);
  formData.append('email', email);
  formData.append('surl', 'http://localhost:3001/api/easebuzz/success'); // Needs ENV URL for prod
  formData.append('furl', 'http://localhost:3001/api/easebuzz/failure');
  formData.append('hash', hash);

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://testpay.easebuzz.in/payment/initiateLink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Easebuzz initiate error:', error);
    res.status(500).json({ status: 0, message: 'Failed to initiate payment' });
  }
});

app.post('/api/easebuzz/success', async (req, res) => {
  const { txnid } = req.body;
  await Booking.findOneAndUpdate({id: txnid}, {status: 'confirmed'});
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/bookings?payment=success&txnid=${txnid}`);
});

app.post('/api/easebuzz/failure', async (req, res) => {
  const { txnid } = req.body;
  await Booking.findOneAndUpdate({id: txnid}, {status: 'cancelled'});
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/bookings?payment=failure&txnid=${txnid}`);
});

app.post('/simulate-upi-payment', (req, res) => {
  const { amount } = req.body;
  setTimeout(() => {
    res.json({
      status: 'success',
      transactionId: 'TXN' + Date.now(),
      message: 'Payment of ₹' + amount + ' received successfully'
    });
  }, 2000);
});

// --- PDF & Email (Mocked for simplicity) ---
app.post('/api/generate-receipt', async (req, res) => {
  res.json({ message: "Receipt generation logic omitted in Mongoose rewrite stub" });
});
app.post('/api/send-email', async (req, res) => {
  res.json({ success: true, message: "Email mocked" });
});

// Seed Initial Data
async function seedData() {
  const vCount = await Vehicle.countDocuments();
  if (vCount === 0) {
    console.log("Seeding Database from db.json...");
    try {
      const dbJson = require('./db.json');
      if (dbJson.vehicles) await Vehicle.insertMany(dbJson.vehicles);
      if (dbJson.users) await User.insertMany(dbJson.users);
      if (dbJson.bookings) await Booking.insertMany(dbJson.bookings);
      if (dbJson.ads) await Ad.insertMany(dbJson.ads);
      if (dbJson.settings) await Settings.insertMany(dbJson.settings);
      console.log("Database seeded successfully.");
    } catch (err) {
      console.log("Seeding failed: ", err);
    }
  }
}
mongoose.connection.once('open', seedData);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Production Backend Server running on port ${PORT}`);
});
