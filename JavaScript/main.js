// Main JavaScript file for SportsStatsHub

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initForms();
    initInteractiveElements();
    initGallery();
});

// Navigation active state
function initNavigation() {
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href').toLowerCase();
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
        
        // Add smooth scrolling for internal links
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Form handling
function initForms() {
    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Enquiry form handling
    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', handleEnquirySubmit);
        const resetBtn = document.getElementById('enquiryReset');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetEnquiryForm);
        }
    }
    
    // Player search functionality
    const playerSearch = document.getElementById('playerSearch');
    if (playerSearch) {
        playerSearch.addEventListener('submit', handlePlayerSearch);
    }
}

// Interactive elements
function initInteractiveElements() {
    // Tab functionality for player profiles
    initTabs();
    
    // Gallery functionality
    initGallery();
    
    // Smooth animations
    initAnimations();
}

// Tab functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabContainer = this.closest('.player-profile');
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents in this profile
            tabContainer.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            const tabContent = document.getElementById(tabName); // Fixed - use the actual ID
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

// Gallery functionality
function initGallery() {
    const galleryImages = document.querySelectorAll('.gallery-img');
    
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            const targetProfile = this.getAttribute('data-player');
            showPlayerProfile(targetProfile);
        });
        
        // Add hover effects
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Show specific player profile
function showPlayerProfile(profileId) {
    // Hide all profiles
    document.querySelectorAll('.player-profile').forEach(profile => {
        profile.classList.add('hidden');
    });
    
    // Show selected profile
    const targetProfile = document.getElementById(profileId);
    if (targetProfile) {
        targetProfile.classList.remove('hidden');
        targetProfile.scrollIntoView({ behavior: 'smooth' });
    }
}

// Animations
function initAnimations() {
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .player-card, .team-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Contact form handling
function handleContactSubmit(e) {
    e.preventDefault();
    
    if (validateContactForm()) {
        const formData = getFormData(e.target);
        showContactSummary(formData);
    }
}

// Enquiry form handling
function handleEnquirySubmit(e) {
    e.preventDefault();
    
    if (validateEnquiryForm()) {
        const formData = getFormData(e.target);
        showEnquirySummary(formData);
    }
}

// Player search functionality
function handlePlayerSearch(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm) {
        const profiles = document.querySelectorAll('.player-profile');
        let found = false;
        
        profiles.forEach(profile => {
            const playerName = profile.querySelector('.player-name').textContent.toLowerCase();
            if (playerName.includes(searchTerm)) {
                showPlayerProfile(profile.id);
                found = true;
            }
        });
        
        if (!found) {
            alert('No player found matching your search. Please try again.');
        }
    }
}

// Form validation functions
function validateContactForm() {
    const name = document.getElementById('cname').value.trim();
    const email = document.getElementById('cemail').value.trim();
    const messageType = document.getElementById('ctype').value;
    const message = document.getElementById('cmessage').value.trim();
    const errors = [];
    
    // Clear previous errors
    clearErrors('contactErrors');
    
    // Validation rules
    if (!name || name.length < 2) {
        errors.push('Please enter your full name (minimum 2 characters)');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!messageType) {
        errors.push('Please select a message type');
    }
    
    if (!message || message.length < 10) {
        errors.push('Please enter a message (minimum 10 characters)');
    }
    
    if (errors.length > 0) {
        showErrors('contactErrors', errors);
        return false;
    }
    
    return true;
}

function validateEnquiryForm() {
    const name = document.getElementById('ename').value.trim();
    const email = document.getElementById('eemail').value.trim();
    const phone = document.getElementById('ephone').value.trim();
    const enquiryType = document.getElementById('etype').value;
    const details = document.getElementById('edetails').value.trim();
    const errors = [];
    
    // Clear previous errors
    clearErrors('enquiryErrors');
    
    // Validation rules
    if (!name || name.length < 2) {
        errors.push('Please enter your full name (minimum 2 characters)');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (phone && !isValidPhone(phone)) {
        errors.push('Please enter a valid phone number (international format accepted)');
    }
    
    if (!enquiryType) {
        errors.push('Please select an enquiry type');
    }
    
    if (details && details.length > 800) {
        errors.push('Details must be less than 800 characters');
    }
    
    if (errors.length > 0) {
        showErrors('enquiryErrors', errors);
        return false;
    }
    
    return true;
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
    return phoneRegex.test(phone);
}

function getFormData(form) {
    const formData = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name) {
            formData[input.name] = input.value;
        }
    });
    
    return formData;
}

function showErrors(containerId, errors) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    errors.forEach(error => {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = error;
        errorElement.style.color = '#dc3545';
        errorElement.style.marginBottom = '0.5em';
        errorElement.style.padding = '0.5em';
        errorElement.style.backgroundColor = '#f8d7da';
        errorElement.style.border = '1px solid #f5c6cb';
        errorElement.style.borderRadius = '4px';
        container.appendChild(errorElement);
    });
}

function clearErrors(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
}

function showContactSummary(formData) {
    const summary = `
        Name: ${formData.name}
        Email: ${formData.email}
        Message Type: ${formData.messageType}
        Message: ${formData.message}
    `;
    
    document.getElementById('contactPreview').textContent = summary;
    
    // Create mailto link
    const subject = `SportsStatsHub Contact: ${formData.messageType}`;
    const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0AMessage Type: ${formData.messageType}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
    const mailtoLink = `mailto:info@sportsstatshub.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    document.getElementById('contactMailto').href = mailtoLink;
    document.getElementById('contactForm').hidden = true;
    document.getElementById('contactSummary').hidden = false;
    
    // Add back button functionality
    document.getElementById('contactBack').addEventListener('click', function() {
        document.getElementById('contactSummary').hidden = true;
        document.getElementById('contactForm').hidden = false;
    });
}

function showEnquirySummary(formData) {
    let response = '';
    let pricing = '';
    
    // Enhanced responses based on enquiry type
    switch(formData.type) {
        case 'data':
            pricing = 'Dataset access starts at R5,000/month';
            response = `Thank you for your interest in our comprehensive sports datasets! ${pricing}. Our datasets include real-time player statistics, team performance metrics, and historical data. We'll contact you within 24 hours to discuss your specific data requirements.`;
            break;
        case 'subscription':
            pricing = 'Team subscriptions start at R999/month';
            response = `Great choice! ${pricing} and include advanced analytics, custom reports, and API access. Our team will prepare a customized subscription package based on your indicated budget of ${formData.bget ? 'R' + formData.budget : 'your requirements'}.`;
            break;
        case 'sponsorship':
            pricing = 'Sponsorship packages from R15,000';
            response = `We appreciate your sponsorship interest! ${pricing}. Sponsorship includes brand visibility across our platform, featured content, and data partnership opportunities. We'll contact you to discuss collaboration possibilities.`;
            break;
        case 'volunteer':
            response = 'Thank you for your interest in volunteering! We\'re always looking for passionate sports enthusiasts to help with data collection, research, and community engagement. Our volunteer coordinator will contact you about current opportunities.';
            break;
        default:
            response = 'Thank you for your enquiry! Our team will review your request and contact you within 2 business days to discuss how we can assist you.';
    }
    
    const summary = `
        ${response}
        
        Enquiry Summary:
        • Name: ${formData.name}
        • Email: ${formData.email}
        • Phone: ${formData.phone || 'Not provided'}
        • Enquiry Type: ${getEnquiryTypeLabel(formData.type)}
        • Budget: ${formData.budget ? 'R ' + formData.budget : 'Not specified'}
        • Details: ${formData.details || 'No additional details provided'}
    `;
    
    document.getElementById('enquirySummary').textContent = summary;
    document.getElementById('enquiryForm').hidden = true;
    document.getElementById('enquiryResponse').hidden = false;
    
    // Add back button functionality
    document.getElementById('enquiryBack').addEventListener('click', function() {
        document.getElementById('enquiryResponse').hidden = true;
        document.getElementById('enquiryForm').hidden = false;
        resetEnquiryForm();
    });
}

function getEnquiryTypeLabel(type) {
    const types = {
        'data': 'Dataset / API Access',
        'subscription': 'Team Subscription',
        'sponsorship': 'Sponsorship',
        'volunteer': 'Volunteer Opportunity',
        'other': 'Other'
    };
    return types[type] || type;
}

function resetEnquiryForm() {
    document.getElementById('enquiryForm').reset();
    clearErrors('enquiryErrors');
}

// Google Maps integration
function initMap() {
    const location = { lat: -26.397747, lng: 27.808010 }; // Coordinates for Lawley, South Africa
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: location,
    });
    new google.maps.Marker({
        position: location,
        map: map,
        title: "SportsStatsHub Office",
    });
}

// Lightbox functionality
function initLightbox() {
    const images = document.querySelectorAll('.player-image, .gallery-img, .team-logo');
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="" alt="">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">‹</button>
            <button class="lightbox-next">›</button>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    const imageArray = Array.from(images);
    
    function showLightbox(index) {
        currentIndex = index;
        lightboxImg.src = imageArray[index].src;
        lightboxImg.alt = imageArray[index].alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    images.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            showLightbox(index);
        });
    });
    
    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + imageArray.length) % imageArray.length;
        showLightbox(currentIndex);
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % imageArray.length;
        showLightbox(currentIndex);
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + imageArray.length) % imageArray.length;
            showLightbox(currentIndex);
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % imageArray.length;
            showLightbox(currentIndex);
        }
    });
}