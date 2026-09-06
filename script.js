// ====================== DATA GET/SET ======================
function getNotices() {
    return JSON.parse(localStorage.getItem('notices')) || [];
}

function saveNotices(notices) {
    localStorage.setItem('notices', JSON.stringify(notices));
}

function getEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
}

function saveEvents(events) {
    localStorage.setItem('events', JSON.stringify(events));
}

function getRegistrations() {
    return JSON.parse(localStorage.getItem('registrations')) || [];
}

function saveRegistrations(regs) {
    localStorage.setItem('registrations', JSON.stringify(regs));
}

// ====================== NOTICE FUNCTIONS ======================
function displayNotices() {
    const notices = getNotices();
    const noticeList = document.getElementById('noticeList');
    
    if (!noticeList) return;

    if (notices.length === 0) {
        noticeList.innerHTML = `<div class="col-12"><div class="alert alert-info">No notices available yet.</div></div>`;
        return;
    }

    noticeList.innerHTML = notices.map((notice, index) => `
        <div class="col-md-6 col-lg-4">
            <div class="card notice-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${notice.title}</h5>
                    <p class="card-text">${notice.description}</p>
                    <small class="text-muted">Posted on: ${notice.date}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function addNotice() {
    const title = document.getElementById('noticeTitle').value.trim();
    const description = document.getElementById('noticeDesc').value.trim();

    if (!title || !description) {
        alert('Please fill all fields');
        return;
    }

    const notices = getNotices();
    notices.unshift({
        id: Date.now(),
        title: title,
        description: description,
        date: new Date().toLocaleDateString('en-IN')
    });

    saveNotices(notices);
    alert('Notice added successfully!');
    
    // Form clear
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeDesc').value = '';
}

// ====================== EVENT FUNCTIONS ======================
function displayEvents() {
    const events = getEvents();
    const eventList = document.getElementById('eventList');
    
    if (!eventList) return;

    if (events.length === 0) {
        eventList.innerHTML = `<div class="col-12"><div class="alert alert-info">No events available yet.</div></div>`;
        return;
    }

    eventList.innerHTML = events.map(event => {
        const registrations = getRegistrations().filter(r => r.eventId === event.id);
        const seatsLeft = event.maxSeats - registrations.length;

        return `
        <div class="col-md-6 col-lg-4">
            <div class="card event-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text">${event.description}</p>
                    <ul class="list-unstyled">
                        <li><strong>Date:</strong> ${event.date}</li>
                        <li><strong>Venue:</strong> ${event.venue}</li>
                        <li><strong>Seats Left:</strong> ${seatsLeft} / ${event.maxSeats}</li>
                    </ul>
                    ${seatsLeft > 0 ? 
                        `<button class="btn btn-primary w-100" onclick="openRegisterModal(${event.id})">Register Now</button>` :
                        `<button class="btn btn-secondary w-100" disabled>Seats Full</button>`
                    }
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function addEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const venue = document.getElementById('eventVenue').value.trim();
    const maxSeats = parseInt(document.getElementById('eventSeats').value);
    const description = document.getElementById('eventDesc').value.trim();

    if (!title || !date || !venue || !maxSeats || !description) {
        alert('Please fill all fields');
        return;
    }

    const events = getEvents();
    events.unshift({
        id: Date.now(),
        title,
        date,
        venue,
        maxSeats,
        description
    });

    saveEvents(events);
    alert('Event added successfully!');

    // Form clear
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventVenue').value = '';
    document.getElementById('eventSeats').value = '';
    document.getElementById('eventDesc').value = '';
}

// ====================== REGISTRATION ======================
function openRegisterModal(eventId) {
    document.getElementById('eventId').value = eventId;
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

// Form submit
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const eventId = parseInt(document.getElementById('eventId').value);
            const name = document.getElementById('studentName').value.trim();
            const rollNo = document.getElementById('rollNo').value.trim();
            const branch = document.getElementById('branch').value.trim();
            const year = document.getElementById('year').value;
            const email = document.getElementById('email').value.trim();

            // Already registered check
            const registrations = getRegistrations();
            const already = registrations.find(r => r.eventId === eventId && r.rollNo === rollNo);
            if (already) {
                alert('You have already registered for this event!');
                return;
            }

            // Seats check
            const event = getEvents().find(e => e.id === eventId);
            const currentRegs = registrations.filter(r => r.eventId === eventId);
            if (currentRegs.length >= event.maxSeats) {
                alert('Sorry, seats are full!');
                return;
            }

            // Save registration
            registrations.push({
                id: Date.now(),
                eventId,
                name,
                rollNo,
                branch,
                year,
                email,
                registeredAt: new Date().toLocaleString('en-IN')
            });

            saveRegistrations(registrations);
            alert('Registration Successful!');
            
            // Modal band karo + form clear
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            form.reset();
            displayEvents(); // seats update ho jayein
        });
    }
});

// ====================== ADMIN LOGIN ======================
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        checkAdminLogin();
    } else {
        alert('Wrong Password!');
    }
}

function adminLogout() {
    localStorage.removeItem('isAdmin');
    checkAdminLogin();
}

function checkAdminLogin() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('adminDashboard');

    if (loginSection && dashboard) {
        if (isAdmin) {
            loginSection.style.display = 'none';
            dashboard.style.display = 'block';
            showAllRegistrations();
        } else {
            loginSection.style.display = 'block';
            dashboard.style.display = 'none';
        }
    }
}

function showAllRegistrations() {
    const container = document.getElementById('allRegistrations');
    if (!container) return;

    const registrations = getRegistrations();
    const events = getEvents();

    if (registrations.length === 0) {
        container.innerHTML = '<p class="text-muted">No registrations yet.</p>';
        return;
    }

    let html = `<div class="table-responsive"><table class="table table-bordered table-striped">
        <thead class="table-dark">
            <tr>
                <th>Event</th>
                <th>Name</th>
                <th>Roll No</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Email</th>
                <th>Registered At</th>
            </tr>
        </thead>
        <tbody>`;

    registrations.forEach(reg => {
        const event = events.find(e => e.id === reg.eventId);
        html += `
            <tr>
                <td>${event ? event.title : 'Deleted Event'}</td>
                <td>${reg.name}</td>
                <td>${reg.rollNo}</td>
                <td>${reg.branch}</td>
                <td>${reg.year}</td>
                <td>${reg.email}</td>
                <td>${reg.registeredAt}</td>
            </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}
