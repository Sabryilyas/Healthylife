const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
  createDefaultAdmin(); // Create default admin if it doesn't exist
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
  console.error('MongoDB URI:', process.env.MONGODB_URI);
  process.exit(1); // Exit the process if unable to connect to MongoDB
});

// WebSocket broadcast
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

//admin user
async function createDefaultAdmin() {
  try {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const existingAdmin = await Admin.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = new Admin({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Schema Definitions
const appointmentSchema = new mongoose.Schema({
  doctorId: String,
  doctorName: String,
  date: String,
  time: String,
  patientName: String,
  patientPhone: String,
  patientEmail: String,
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], required: true }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Public Routes
app.get('/api/appointments', async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const appointments = await Appointment.find({ doctorId, date });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    broadcast({ type: 'NEW_APPOINTMENT', appointment: newAppointment });
    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
});

// Admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

app.get('/api/admin/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Serve static
app.use('/admin', express.static('admin'));

