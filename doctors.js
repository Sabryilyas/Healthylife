const doctors = [
    { name: "Dr. Mujeeb Sufiyaan", specialization: "General Medicine", hospital: "Nawaloka Hospital", image: "assets/doctor-1.jpg" },
    { name: "Dr. Kanishka Perera", specialization: "Neurosurgeon", hospital: "Asiri Hospital", image: "assets/doctor-2.jpg" },
    { name: "Dr. Tharushi Silva", specialization: "Dermatologist", hospital: "Lanka Hospitals", image: "assets/doctor-3.jpg" },
    { name: "Dr. Shihan Rathnayake", specialization: "Pediatrician", hospital: "Hemas Hospital", image: "assets/doctor-4.jpg" },
    { name: "Dr. Ishara Jayasinghe", specialization: "Orthopedic Surgeon", hospital: "Durdans Hospital", image: "assets/doctor-5.jpg" },
    { name: "Dr. Dilshan Samara", specialization: "Dentistry", hospital: "Kings Hospital", image: "assets/doctor-6.jpg" },
    { name: "Dr. Nalin Fernando", specialization: "General Medicine", hospital: "Durdans Hospital", image: "assets/doctor-7.jpg" },
    { name: "Dr. Pradeep Paul", specialization: "Gynecologist", hospital: "Asiri Hospital", image: "assets/doctor-8.jpg" }
  ];
  

function handleChannelClick(doctorId) {
  window.location.href = `booking.html?doctorId=${doctorId}`;
}

//renderDoctors function
function renderDoctors(doctorsToRender) {
  const doctorsList = document.getElementById('doctors-list');
  doctorsList.innerHTML = '';
  doctorsToRender.forEach((doctor, index) => {
    const doctorCard = document.createElement('div');
    doctorCard.className = 'doctors__card';
    doctorCard.innerHTML = `
      <div class="doctors__card__image">
        <img src="${doctor.image}" alt="${doctor.name}" />
      </div>
      <h4>${doctor.name}</h4>
      <p>${doctor.specialization}</p>
      <p>${doctor.hospital}</p>
      <button class="btn channel-btn" onclick="handleChannelClick(${index + 1})">Channel Doctor</button>
    `;
    doctorsList.appendChild(doctorCard);
  });

  }
  
  function initializePage() {
    renderDoctors(doctors);
  
    //search
    const searchInput = document.getElementById('doctor-search');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredDoctors = doctors.filter(doctor => 
          doctor.name.toLowerCase().includes(searchTerm) ||
          doctor.specialization.toLowerCase().includes(searchTerm) ||
          doctor.hospital.toLowerCase().includes(searchTerm)
        );
        renderDoctors(filteredDoctors);
      });
    }
  }
  
  // Call initializePage
  document.addEventListener('DOMContentLoaded', initializePage);