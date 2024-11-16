const API_BASE_URL = 'http://localhost:5000';

//URL parameters
const urlParams = new URLSearchParams(window.location.search);
const doctorId = urlParams.get('doctorId');

// Sample doctor data
const doctors = {
    '1': { name: "Dr. Mujeeb Sufiyaan", specialization: "General Medicine", image: "assets/doctor-1.jpg" },
    '2': { name: "Dr. Kanishka Perera", specialization: "Neurosurgeon", image: "assets/doctor-2.jpg" },
    '3': { name: "Dr. Tharushi Silva", specialization: "Dermatologist", image: "assets/doctor-3.jpg" },
    '4': { name: "Dr. Shihan Rathnayake", specialization: "Pediatrician", image: "assets/doctor-4.jpg" },
    '5': { name: "Dr. Ishara Jayasinghe", specialization: "Orthopedic Surgeon", image: "assets/doctor-5.jpg" },
    '6': { name: "Dr. Dilshan Samara", specialization: "Dentistry", image: "assets/doctor-6.jpg" },
    '7': { name: "Dr. Nalin Fernando", specialization: "General Medicine", image: "assets/doctor-7.jpg" },
    '8': { name: "Dr. Pradeep Paul", specialization: "Gynecologist", image: "assets/doctor-8.jpg" }
  };

// Initialize page
async function initializePage() {
  const doctor = doctors[doctorId];
  if (doctor) {
    document.getElementById('doctor-name').textContent = doctor.name;
    document.getElementById('doctor-specialization').textContent = doctor.specialization;
    document.getElementById('doctor-image').src = doctor.image;
  }

  // Set min date to today
  const dateInput = document.getElementById('appointment-date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  // Add event listener for date change
  dateInput.addEventListener('change', updateBookedTimes);

  // Initialize booked times
  await updateBookedTimes();

  // Start the countdown timer
  startCountdown(10 * 60); // 10 minutes in seconds
}

// Update booked times based on selected date
async function updateBookedTimes() {
  const dateInput = document.getElementById('appointment-date');
  const selectedDate = dateInput.value;
  const bookedTimesList = document.getElementById('booked-times-list');

  // Clear existing booked times
  bookedTimesList.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments?doctorId=${doctorId}&date=${selectedDate}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const appointments = await response.json();

    if (appointments.length > 0) {
      appointments.forEach(appointment => {
        const li = document.createElement('li');
        li.textContent = appointment.time;
        bookedTimesList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No bookings for this date';
      bookedTimesList.appendChild(li);
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    const li = document.createElement('li');
    li.textContent = 'Error fetching appointments. Please try again later.';
    bookedTimesList.appendChild(li);
  }
}

// Countdown timer function
function startCountdown(duration) {
  let timer = duration;
  const countdownElement = document.getElementById('countdown');
  
  const countdown = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (--timer < 0) {
      clearInterval(countdown);
      alert('Booking session expired. Please try again.');
      window.location.href = 'doctors.html';
    }
  }, 1000);
}

// Form submission
document.getElementById('booking-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const appointmentDate = formData.get('appointment-date');
  const appointmentTime = formData.get('appointment-time');
  const doctorName = doctors[doctorId].name;

  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorId: doctorId,
        doctorName: doctorName,
        date: appointmentDate,
        time: appointmentTime,
        patientName: formData.get('name'),
        patientPhone: formData.get('phone'),
        patientEmail: formData.get('email'),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const arrivalTime = new Date(appointmentDateTime.getTime() - 15 * 60000);

    const confirmationMessage = `
      Your Appointment Confirmed!
      Doctor: ${doctorName}
      Date: ${appointmentDate}
      Time: ${appointmentTime}
      Please arrive at ${arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (15 minutes before your appointment).
    `;

    alert(confirmationMessage);
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error booking appointment:', error);
    alert('Error booking appointment. Please try again.');
  }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', initializePage);
