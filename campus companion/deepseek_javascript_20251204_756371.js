/**
 * ============================================
 * CAMPUS COMPANION - USIU SMART CAMPUS HELPER
 * ============================================
 * 
 * Main Application JavaScript
 * 
 * Features:
 * - Single Page Application Architecture
 * - User Authentication & Authorization
 * - Student & Admin Dashboards
 * - Profile Management
 * - Content Management System
 * - Responsive Design
 * - Form Validation
 * - Error Handling
 * - Session Management
 * 
 * Architecture:
 * 1. State Management
 * 2. UI Functions
 * 3. Event Handlers
 * 4. Data Management
 * 5. Utility Functions
 * 6. Initialization
 */

// ============================================
// 1. STATE MANAGEMENT
// ============================================

/**
 * Current user state
 * @type {Object|null}
 * @property {string} name - User's full name
 * @property {string} email - User's email
 * @property {string} type - User type ('student' or 'admin')
 */
let currentUser = null;

/**
 * Application state
 * @type {Object}
 */
const appState = {
    isLoading: false,
    lastActivity: Date.now(),
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    currentSection: 'home'
};

/**
 * Data storage (simulating database)
 * In a production app, this would be replaced with API calls
 */
const database = {
    announcements: [],
    events: [],
    schedules: [],
    users: [],
    
    // Initialize with sample data
    init: function() {
        // Sample announcements
        this.announcements = [
            {
                id: 1,
                title: "Midterm Project Submission Deadline Extended",
                content: "The deadline for midterm project submissions has been extended to December 20, 2025.",
                priority: "important",
                date: "December 15, 2025",
                author: "Academic Office"
            },
            {
                id: 2,
                title: "Campus Maintenance - Library Closed on Saturday",
                content: "The main library will be closed this Saturday for scheduled maintenance. E-resources will remain available.",
                priority: "normal",
                date: "December 12, 2025",
                author: "Facilities Management"
            },
            {
                id: 3,
                title: "Career Fair - December 5-7, 2025",
                content: "Annual career fair featuring top companies. Register through the career portal.",
                priority: "urgent",
                date: "December 10, 2025",
                author: "Career Services"
            }
        ];

        // Sample events
        this.events = [
            {
                id: 1,
                title: "Tech Club Meeting",
                description: "Monthly meeting for tech enthusiasts. Discuss latest trends and projects.",
                date: "2025-12-20",
                time: "14:00",
                location: "Student Center",
                organizer: "Tech Club"
            },
            {
                id: 2,
                title: "Guest Lecture: AI in Education",
                description: "Join us for an insightful lecture on AI applications in modern education.",
                date: "2025-12-25",
                time: "10:00",
                location: "Auditorium A",
                organizer: "Computer Science Dept"
            },
            {
                id: 3,
                title: "Annual Career Fair",
                description: "Connect with top employers and explore career opportunities.",
                date: "2025-12-30",
                time: "09:00",
                location: "Sports Complex",
                organizer: "Career Services"
            }
        ];

        // Sample schedules
        this.schedules = [
            {
                id: 1,
                course: "APT3065 - Software Engineering",
                date: "2025-12-15",
                time: "08:00",
                room: "TC-304",
                instructor: "Dr. Smith"
            },
            {
                id: 2,
                course: "APT3070 - Database Systems",
                date: "2025-12-15",
                time: "10:30",
                room: "TC-301",
                instructor: "Prof. Johnson"
            },
            {
                id: 3,
                course: "APT3080 - Web Development",
                date: "2025-12-15",
                time: "14:00",
                room: "TC-310",
                instructor: "Dr. Williams"
            }
        ];
    }
};

/**
 * Profile data for current user
 */
const userProfileData = {
    student: {
        id: "669430",
        program: "Bachelor of Science in Information Systems & Technology",
        phone: "+254 712 345 678",
        address: "USIU-Africa, Thika Road",
        email: "carl.kitusa@usiu.ac.ke"
    },
    admin: {
        id: "ADM001",
        department: "Administration",
        phone: "+254 711 222 333",
        address: "USIU-Africa, Administration Building",
        email: "admin@usiu.ac.ke"
    }
};

// ============================================
// 2. UTILITY FUNCTIONS
// ============================================

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - Message type ('success', 'error', 'info')
 * @param {string} elementId - Optional element ID
 */
function showNotification(message, type = 'success', elementId = null) {
    let element;
    if (elementId) {
        element = document.getElementById(elementId);
    } else {
        element = document.querySelector('.notification-area');
        if (!element) {
            element = document.createElement('div');
            element.className = 'notification-area';
            document.body.appendChild(element);
        }
    }

    if (element) {
        element.textContent = message;
        element.className = `${type}-message show`;
        
        setTimeout(() => {
            element.classList.remove('show');
        }, 3000);
    }
}

/**
 * Show loading state
 * @param {boolean} isLoading - Whether to show loading state
 */
function setLoading(isLoading) {
    appState.isLoading = isLoading;
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    });
}

/**
 * Format date to readable string
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Generate avatar initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function generateAvatar(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate form data
 * @param {Object} formData - Form data object
 * @param {Array} requiredFields - Required field names
 * @returns {Object} Validation result
 */
function validateForm(formData, requiredFields) {
    const errors = {};
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors[field] = `${field} is required`;
        }
        
        // Special validations
        if (field === 'email' && formData[field]) {
            if (!validateEmail(formData[field])) {
                errors[field] = 'Please enter a valid email address';
            }
        }
        
        if (field === 'password' && formData[field]) {
            if (formData[field].length < 8) {
                errors[field] = 'Password must be at least 8 characters';
            }
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Clear form validation errors
 * @param {string} formId - Form ID
 */
function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

/**
 * Show form validation errors
 * @param {Object} errors - Error object
 */
function showFormErrors(errors) {
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.classList.remove('hidden');
        }
    });
}

// ============================================
// 3. UI FUNCTIONS
// ============================================

/**
 * Show specific section and hide others
 * @param {string} sectionId - Section ID to show
 */
function showSection(sectionId) {
    // Track navigation
    appState.currentSection = sectionId;
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Update active nav link
        updateActiveNav(sectionId);
        
        // Handle section-specific logic
        onSectionShow(sectionId);
    }

    // Close mobile menu if open
    document.getElementById('main-nav').classList.remove('active');
    document.querySelector('.mobile-menu').setAttribute('aria-expanded', 'false');
    
    // Update user activity
    updateUserActivity();
}

/**
 * Handle section-specific logic when shown
 * @param {string} sectionId - Section ID
 */
function onSectionShow(sectionId) {
    switch(sectionId) {
        case 'profile':
            if (currentUser) {
                renderProfile();
            }
            break;
        case 'dashboard':
            if (currentUser) {
                updateDashboard();
            }
            break;
        case 'features':
            // Could add animation to feature cards
            break;
    }
}

/**
 * Update active navigation link
 * @param {string} sectionId - Active section ID
 */
function updateActiveNav(sectionId) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`nav a[onclick*="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const nav = document.getElementById('main-nav');
    const isExpanded = nav.classList.toggle('active');
    document.querySelector('.mobile-menu').setAttribute('aria-expanded', isExpanded);
}

/**
 * Handle Get Started button
 */
function handleGetStarted() {
    if (currentUser) {
        showSection('dashboard');
    } else {
        showSection('login');
    }
}

/**
 * Update dashboard based on user type
 */
function updateDashboard() {
    const studentDashboard = document.getElementById('studentDashboard');
    const adminDashboard = document.getElementById('adminDashboard');
    
    if (currentUser && currentUser.type === 'admin') {
        studentDashboard.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        // Open first tab for admin
        openAdminTab('announcements');
    } else {
        studentDashboard.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
}

/**
 * Update auth buttons based on login status
 */
function updateAuthButtons() {
    const authButtons = document.getElementById('authButtons');
    const heroButtons = document.getElementById('heroButtons');
    
    if (currentUser) {
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="showSection('dashboard')">
                <i class="fas fa-tachometer-alt"></i> Dashboard
            </button>
        `;
        heroButtons.innerHTML = '';
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="showSection('login')">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
            <button class="btn btn-primary" onclick="showSection('register')">
                <i class="fas fa-user-plus"></i> Register
            </button>
        `;
        heroButtons.innerHTML = `
            <button class="btn btn-primary pulse" onclick="handleGetStarted()">
                <i class="fas fa-user-plus"></i> Get Started
            </button>
            <button class="btn btn-outline" onclick="showSection('features')">
                <i class="fas fa-info-circle"></i> Learn More
            </button>
        `;
    }
}

/**
 * Open admin tab
 * @param {string} tabName - Tab name to open
 */
function openAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected tab content
    const tabContent = document.getElementById(tabName + '-tab');
    if (tabContent) {
        tabContent.classList.remove('hidden');
    }
    
    // Mark the clicked tab as active
    document.querySelectorAll('.admin-tab').forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        }
    });
}

// ============================================
// 4. PROFILE MANAGEMENT
// ============================================

/**
 * Render profile based on user type
 * @param {boolean} editMode - Whether to show edit mode
 */
function renderProfile(editMode = false) {
    const profileInfo = document.getElementById('profileInfoContent');
    const profileActions = document.getElementById('profileActions');
    
    if (!currentUser) return;
    
    const isAdmin = currentUser.type === 'admin';
    const profileData = userProfileData[currentUser.type];
    
    if (editMode) {
        // Edit mode - show form inputs
        profileInfo.innerHTML = `
            <div class="info-group">
                <label>Full Name</label>
                <input type="text" id="editName" class="form-control" value="${currentUser.name}" required>
            </div>
            <div class="info-group">
                <label>Email</label>
                <input type="email" id="editEmail" class="form-control" value="${currentUser.email}" required>
            </div>
            <div class="info-group">
                <label>${isAdmin ? 'Admin ID' : 'Student ID'}</label>
                <input type="text" id="editId" class="form-control" value="${profileData.id}" required>
            </div>
            <div class="info-group">
                <label>${isAdmin ? 'Department' : 'Program'}</label>
                <input type="text" id="editProgram" class="form-control" value="${isAdmin ? profileData.department : profileData.program}" required>
            </div>
            <div class="info-group">
                <label>Phone</label>
                <input type="tel" id="editPhone" class="form-control" value="${profileData.phone}" required>
            </div>
            <div class="info-group">
                <label>Address</label>
                <input type="text" id="editAddress" class="form-control" value="${profileData.address}" required>
            </div>
        `;
        
        profileActions.innerHTML = `
            <button class="btn btn-success" onclick="saveProfile()">
                <i class="fas fa-save"></i> Save Changes
            </button>
            <button class="btn btn-outline" onclick="renderProfile(false)">
                <i class="fas fa-times"></i> Cancel
            </button>
        `;
    } else {
        // View mode - show information
        profileInfo.innerHTML = `
            <div class="info-group">
                <label>${isAdmin ? 'Admin ID' : 'Student ID'}</label>
                <p>${profileData.id}</p>
            </div>
            <div class="info-group">
                <label>${isAdmin ? 'Department' : 'Program'}</label>
                <p>${isAdmin ? profileData.department : profileData.program}</p>
            </div>
            <div class="info-group">
                <label>Phone</label>
                <p>${profileData.phone}</p>
            </div>
            <div class="info-group">
                <label>Address</label>
                <p>${profileData.address}</p>
            </div>
        `;
        
        profileActions.innerHTML = `
            <button class="btn btn-primary" onclick="renderProfile(true)">
                <i class="fas fa-edit"></i> Edit Profile
            </button>
            <button class="btn btn-outline" onclick="showSection('dashboard')">
                <i class="fas fa-arrow-left"></i> Back to Dashboard
            </button>
        `;
    }
}

/**
 * Save profile changes
 */
function saveProfile() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.type === 'admin';
    
    // Get form values
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const id = document.getElementById('editId').value.trim();
    const program = document.getElementById('editProgram').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    
    // Basic validation
    if (!name || !email || !id || !program || !phone || !address) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Update current user info
    currentUser.name = name;
    currentUser.email = email;
    
    // Update profile data
    userProfileData[currentUser.type].id = id;
    if (isAdmin) {
        userProfileData[currentUser.type].department = program;
    } else {
        userProfileData[currentUser.type].program = program;
    }
    userProfileData[currentUser.type].phone = phone;
    userProfileData[currentUser.type].address = address;
    userProfileData[currentUser.type].email = email;
    
    // Update UI
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = generateAvatar(currentUser.name);
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileAvatar').textContent = generateAvatar(currentUser.name);
    
    // Show success message and return to view mode
    showNotification('Profile updated successfully!', 'success');
    renderProfile(false);
}

// ============================================
// 5. DATA MANAGEMENT
// ============================================

/**
 * Render announcements list
 */
function renderAnnouncements() {
    const list = document.getElementById('announcementsList');
    if (!list) return;
    
    list.innerHTML = '<h4>Posted Announcements</h4>';
    
    if (database.announcements.length === 0) {
        list.innerHTML += `
            <div class="empty-state" id="emptyAnnouncements">
                <i class="fas fa-bullhorn"></i>
                <p>No announcements posted yet. Create your first announcement above.</p>
            </div>
        `;
        return;
    }
    
    database.announcements.forEach(announcement => {
        const item = document.createElement('div');
        item.className = 'content-item';
        item.innerHTML = `
            <div class="content-info">
                <h4>${announcement.title} <span class="priority-badge" data-priority="${announcement.priority}">${announcement.priority}</span></h4>
                <p>${announcement.content}</p>
                <small>Posted: ${announcement.date} | Author: ${announcement.author}</small>
            </div>
            <div class="content-actions">
                <button class="btn btn-danger" onclick="deleteAnnouncement(${announcement.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

/**
 * Render events list
 */
function renderEvents() {
    const list = document.getElementById('eventsList');
    if (!list) return;
    
    list.innerHTML = '<h4>Added Events</h4>';
    
    if (database.events.length === 0) {
        list.innerHTML += `
            <div class="empty-state" id="emptyEvents">
                <i class="fas fa-calendar"></i>
                <p>No events added yet. Create your first event above.</p>
            </div>
        `;
        return;
    }
    
    database.events.forEach(event => {
        const formattedDate = formatDate(event.date);
        const item = document.createElement('div');
        item.className = 'content-item';
        item.innerHTML = `
            <div class="content-info">
                <h4>${event.title}</h4>
                <p>${event.description}</p>
                <small>Date: ${formattedDate} | Time: ${event.time} | Location: ${event.location}</small>
            </div>
            <div class="content-actions">
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

/**
 * Render schedules list
 */
function renderSchedules() {
    const list = document.getElementById('schedulesList');
    if (!list) return;
    
    list.innerHTML = '<h4>Updated Schedules</h4>';
    
    if (database.schedules.length === 0) {
        list.innerHTML += `
            <div class="empty-state" id="emptySchedules">
                <i class="fas fa-calendar-alt"></i>
                <p>No schedules updated yet. Create your first schedule above.</p>
            </div>
        `;
        return;
    }
    
    database.schedules.forEach(schedule => {
        const formattedDate = formatDate(schedule.date);
        const item = document.createElement('div');
        item.className = 'content-item';
        item.innerHTML = `
            <div class="content-info">
                <h4>${schedule.course}</h4>
                <p>Instructor: ${schedule.instructor}</p>
                <small>Date: ${formattedDate} | Time: ${schedule.time} | Room: ${schedule.room}</small>
            </div>
            <div class="content-actions">
                <button class="btn btn-danger" onclick="deleteSchedule(${schedule.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

/**
 * Render users list
 */
function renderUsers() {
    const list = document.getElementById('usersList');
    if (!list) return;
    
    list.innerHTML = '<h4>Added Users</h4>';
    
    if (database.users.length === 0) {
        list.innerHTML += `
            <div class="empty-state" id="emptyUsers">
                <i class="fas fa-users"></i>
                <p>No users added yet. Add your first user above.</p>
            </div>
        `;
        return;
    }
    
    database.users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'content-item';
        item.innerHTML = `
            <div class="content-info">
                <h4>${user.name}</h4>
                <p>${user.email}</p>
                <small>Type: ${user.type} | ID: ${user.id}</small>
            </div>
            <div class="content-actions">
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

/**
 * Delete announcement
 * @param {number} id - Announcement ID
 */
function deleteAnnouncement(id) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        database.announcements = database.announcements.filter(a => a.id !== id);
        renderAnnouncements();
        showNotification('Announcement deleted successfully', 'success');
    }
}

/**
 * Delete event
 * @param {number} id - Event ID
 */
function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        database.events = database.events.filter(e => e.id !== id);
        renderEvents();
        showNotification('Event deleted successfully', 'success');
    }
}

/**
 * Delete schedule
 * @param {number} id - Schedule ID
 */
function deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this schedule?')) {
        database.schedules = database.schedules.filter(s => s.id !== id);
        renderSchedules();
        showNotification('Schedule deleted successfully', 'success');
    }
}

/**
 * Delete user
 * @param {number} id - User ID
 */
function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        database.users = database.users.filter(u => u.id !== id);
        renderUsers();
        showNotification('User deleted successfully', 'success');
    }
}

// ============================================
// 6. FORM HANDLERS
// ============================================

/**
 * Handle login form submission
 */
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors('loginForm');
    
    // Get form data
    const formData = {
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value.trim(),
        userType: document.getElementById('loginUserType').value
    };
    
    // Validate form
    const validation = validateForm(formData, ['email', 'password', 'userType']);
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }
    
    // Show loading state
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        
        // In a real app, this would validate against a backend
        // For demo purposes, we'll simulate a successful login
        currentUser = {
            name: formData.userType === 'admin' ? "Admin User" : "Carl Kitusa",
            email: formData.email,
            type: formData.userType
        };

        // Update UI for logged in user
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.type === 'admin' ? 'Administrator' : 'Student';
        document.getElementById('userAvatar').textContent = generateAvatar(currentUser.name);
        
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileRole').textContent = currentUser.type === 'admin' ? 'Administrator' : 'Student';
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileAvatar').textContent = generateAvatar(currentUser.name);

        // Update dashboard and auth buttons
        updateDashboard();
        updateAuthButtons();

        // Show success message and redirect
        showNotification('Login successful!', 'success', 'loginSuccessMessage');
        setTimeout(() => {
            showSection('dashboard');
        }, 1000);
    }, 1000);
});

/**
 * Handle register form submission
 */
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors('registerForm');
    
    // Get form data
    const formData = {
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value.trim(),
        userType: document.getElementById('regUserType').value
    };
    
    // Validate form
    const validation = validateForm(formData, ['name', 'email', 'password', 'userType']);
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }
    
    // Show loading state
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        
        // In a real app, this would send data to backend
        // For demo purposes, we'll simulate successful registration
        currentUser = {
            name: formData.name,
            email: formData.email,
            type: formData.userType
        };

        // Update UI for logged in user
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.type === 'admin' ? 'Administrator' : 'Student';
        document.getElementById('userAvatar').textContent = generateAvatar(currentUser.name);
        
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileRole').textContent = currentUser.type === 'admin' ? 'Administrator' : 'Student';
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileAvatar').textContent = generateAvatar(currentUser.name);

        // Update dashboard and auth buttons
        updateDashboard();
        updateAuthButtons();

        // Show success message and redirect
        showNotification('Registration successful!', 'success', 'registerSuccessMessage');
        setTimeout(() => {
            showSection('dashboard');
        }, 1000);
    }, 1000);
});

/**
 * Handle announcement form submission
 */
document.getElementById('announcementForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors('announcementForm');
    
    // Get form data
    const formData = {
        title: document.getElementById('announcementTitle').value.trim(),
        content: document.getElementById('announcementContent').value.trim(),
        priority: document.getElementById('announcementPriority').value
    };
    
    // Validate form
    const validation = validateForm(formData, ['title', 'content']);
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }
    
    // Create new announcement
    const newAnnouncement = {
        id: Date.now(),
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        date: new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        author: currentUser.name
    };
    
    // Add to database
    database.announcements.unshift(newAnnouncement);
    
    // Update UI
    renderAnnouncements();
    showNotification('Announcement posted successfully!', 'success', 'announcementSuccessMessage');
    
    // Reset form
    this.reset();
});

/**
 * Handle event form submission
 */
document.getElementById('eventForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors('eventForm');
    
    // Get form data
    const formData = {
        title: document.getElementById('eventTitle').value.trim(),
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value.trim(),
        description: document.getElementById('eventDescription').value.trim()
    };
    
    // Validate form
    const validation = validateForm(formData, ['title', 'date', 'time', 'location', 'description']);
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }
    
    // Validate date (must be future)
    const eventDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
        showNotification('Event date must be in the future', 'error', 'eventDateError');
        return;
    }
    
    // Create new event
    const newEvent = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        organizer: currentUser.name
    };
    
    // Add to database
    database.events.unshift(newEvent);
    
    // Update UI
    renderEvents();
    showNotification('Event added successfully!', 'success', 'eventSuccessMessage');
    
    // Reset form
    this.reset();
});

/**
 * Handle schedule form submission
 */
document.getElementById('scheduleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors('scheduleForm');
    
    // Get form data
    const formData = {
        course: document.getElementById('scheduleCourse').value.trim(),
        date: document.getElementById('scheduleDate').value,
        time: document.getElementById('scheduleTime').value,
        room: document.getElementById('scheduleRoom').value.trim(),
        instructor: document.getElementById('scheduleInstructor').value.trim()
    };
    
    // Validate form
    const validation = validateForm(formData, ['course', 'date', 'time', 'room', 'instructor']);
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }
    
    // Create new schedule
    const newSchedule = {
        id: Date.now(),
        course: formData.course,
        date: formData.date,
        time: formData.time,
        room: formData.room,
        instructor: formData.instructor
    };
    
    // Add to database
    database.schedules.unshift(newSchedule);
    
    // Update UI
    renderSchedules();
    showNotification('Schedule updated successfully!', 'success', 'scheduleSuccessMessage');
    
    // Reset form
    this.reset();
});

/**
 * Handle user form submission
 */
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors('userForm');
    
    // Get form data
    const formData = {
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        type: document.getElementById('userType').value
    };
    
    // Validate form
    const validation = validateForm(formData, ['name', 'email', 'type']);
    if (!validation.isValid) {
        showFormErrors(validation.errors);
        return;
    }
    
    if (!validateEmail(formData.email)) {
        showNotification('Please enter a valid email address', 'error', 'userEmailError');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        type: formData.type
    };
    
    // Add to database
    database.users.unshift(newUser);
    
    // Update UI
    renderUsers();
    showNotification('User added successfully!', 'success', 'userSuccessMessage');
    
    // Reset form
    this.reset();
});

// ============================================
// 7. SESSION MANAGEMENT
// ============================================

/**
 * Update user activity timestamp
 */
function updateUserActivity() {
    appState.lastActivity = Date.now();
}

/**
 * Check session timeout
 */
function checkSessionTimeout() {
    const now = Date.now();
    const timeSinceLastActivity = now - appState.lastActivity;
    
    if (currentUser && timeSinceLastActivity > appState.sessionTimeout) {
        if (confirm('Your session has expired due to inactivity. Would you like to login again?')) {
            logout();
        }
    }
}

/**
 * Clear form data when logging out
 */
function clearForms() {
    // Clear login form
    document.getElementById('loginForm').reset();
    clearFormErrors('loginForm');
    
    // Clear register form
    document.getElementById('registerForm').reset();
    clearFormErrors('registerForm');
    
    // Clear admin forms
    document.getElementById('announcementForm').reset();
    clearFormErrors('announcementForm');
    
    document.getElementById('eventForm').reset();
    clearFormErrors('eventForm');
    
    document.getElementById('scheduleForm').reset();
    clearFormErrors('scheduleForm');
    
    document.getElementById('userForm').reset();
    clearFormErrors('userForm');
}

/**
 * Logout function
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        clearForms();
        updateAuthButtons();
        showSection('home');
        showNotification('Logged out successfully', 'success');
    }
}

// ============================================
// 8. INITIALIZATION
// ============================================

/**
 * Initialize the application
 */
function init() {
    // Initialize database
    database.init();
    
    // Show home section
    showSection('home');
    
    // Update auth buttons
    updateAuthButtons();
    
    // Initialize admin content rendering
    renderAnnouncements();
    renderEvents();
    renderSchedules();
    renderUsers();
    
    // Set form defaults
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Set form defaults
    const eventDateInput = document.getElementById('eventDate');
    const scheduleDateInput = document.getElementById('scheduleDate');
    
    if (eventDateInput) eventDateInput.value = tomorrowStr;
    if (scheduleDateInput) scheduleDateInput.value = todayStr;
    
    // Set current time plus 1 hour
    const nextHour = new Date(today);
    nextHour.setHours(nextHour.getHours() + 1);
    const timeStr = nextHour.getHours().toString().padStart(2, '0') + ':00';
    
    const eventTimeInput = document.getElementById('eventTime');
    const scheduleTimeInput = document.getElementById('scheduleTime');
    
    if (eventTimeInput) eventTimeInput.value = timeStr;
    if (scheduleTimeInput) scheduleTimeInput.value = timeStr;
    
    // Set up activity tracking
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, updateUserActivity);
    });
    
    // Check session timeout every minute
    setInterval(checkSessionTimeout, 60000);
    
    // Add CSS for priority badges
    const style = document.createElement('style');
    style.textContent = `
        .priority-badge {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-left: 0.5rem;
        }
        
        .priority-badge[data-priority="normal"] {
            background-color: rgba(52, 152, 219, 0.2);
            color: #3498db;
        }
        
        .priority-badge[data-priority="important"] {
            background-color: rgba(241, 196, 15, 0.2);
            color: #f1c40f;
        }
        
        .priority-badge[data-priority="urgent"] {
            background-color: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
        }
        
        .notification-area {
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 10000;
            max-width: 300px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);