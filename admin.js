let token = localStorage.getItem('adminToken');
const API_BASE_URL = 'http://localhost:5000';
const ws = new WebSocket('ws://localhost:5000');

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showAdminPanel();
        loadAppointments();
    }
});

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            showAdminPanel();
            loadAppointments();
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
});

function showAdminPanel() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
}

function logout() {
    localStorage.removeItem('adminToken');
    location.reload();
}

async function loadAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');
        
        const appointments = await response.json();
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        alert('Error loading appointments');
    }
}

function displayAppointments(appointments) {
    const appointmentsList = document.getElementById('appointments-list');
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found.</p>';
        return;
    }

    appointmentsList.innerHTML = appointments.map(apt => `
        <div class="appointment-card">
            <h3>${apt.patientName}</h3>
            <p>Date: ${apt.date}</p>
            <p>Time: ${apt.time}</p>
            <p>Doctor: ${apt.doctorName}</p>
            <p>Phone: ${apt.patientPhone}</p>
            <p>Email: ${apt.patientEmail}</p>
        </div>
    `).join('');
}

// WebSocket
ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'NEW_APPOINTMENT') {
        loadAppointments(); // Reload appointments on new appointment
    }
});

