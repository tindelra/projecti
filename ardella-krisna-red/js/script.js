/**
 * ARDELLA & KRISNA WEDDING INVITATION
 * Main JavaScript Configuration
 */

// Music Configuration
var MUSIC = {
    'url': "media/audio/background-music.mp3",
    'box': '#music-box'
};

// Event Date (January 31, 2026 11:00 AM)
var EVENT = new Date('2026-03-25T11:00:00').getTime() / 1000;

// Bank Options
var BANK_OPTIONS = [
    { "id": 23157, "title": "BANK BCA", "credential": "5845039353" }
];

// RSVP
var RSVP = {
    'button_text': { 'attend': "Will Attend", 'not_attend': "Unable To Attend" }
};

var COVERS = [];
var PROTOCOL = { 'slider': '#protocol-slider', 'dots': '#protocol-dots' };

var RSVP_DATA = {
    post: 'rsvp_request', request: 'get_rsvp', content: '', template: 'template_ardella',
    changeButton: '#changeRSVP', amountElement: '#rsvpAmountWrap'
};

var KADO_DATA = {
    post: 'post_kado_data', request: 'getKado', content: '', template: 'template_ardella'
};

window.CROPPED_SONG = { start: null, end: null };


// Countdown Timer
function initCountdown() {
    setInterval(function () {
        const now = new Date().getTime() / 1000;
        const distance = EVENT - now;
        if (distance < 0) return;

        const days = Math.floor(distance / 86400);
        const hours = Math.floor((distance % 86400) / 3600);
        const minutes = Math.floor((distance % 3600) / 60);
        const seconds = Math.floor(distance % 60);

        const d = document.querySelector('.count-day');
        const h = document.querySelector('.count-hour');
        const m = document.querySelector('.count-minute');
        const s = document.querySelector('.count-second');

        if (d) d.textContent = days;
        if (h) h.textContent = hours;
        if (m) m.textContent = minutes;
        if (s) s.textContent = seconds;
    }, 1000);
}

// Guest Name Initialization
function initGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    const isAdmin = urlParams.get('Admin') === 'true';

    if (isAdmin || guestName) {
        // Convert dashes back to spaces for display
        const displayName = isAdmin ? 'Ardella & Krisna' : decodeURIComponent(guestName).replace(/-/g, ' ');
        const elements = document.querySelectorAll('.guest-name');
        elements.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = displayName;
            } else {
                el.textContent = displayName;
            }
        });
    }
}

// RSVP Logic
function initRSVP() {
    // Option Selection
    const rsvpGroups = document.querySelectorAll('.rsvp-group');

    rsvpGroups.forEach(group => {
        const options = group.querySelectorAll('.rsvp-option');

        options.forEach(option => {
            option.addEventListener('click', function () {
                // Remove active class from siblings
                options.forEach(opt => opt.classList.remove('active'));

                // Add active class to clicked option
                this.classList.add('active');

                // Check the radio input
                const input = this.querySelector('input[type="radio"]');
                if (input) {
                    input.checked = true;
                }
            });
        });
    });

    // Guest Counter (Handled in template.js)
}

// Video Loop Logic
function initVideoLoop() {
    // Custom loop to skip entrance animation (first 3 seconds)
    const videos = document.querySelectorAll('.bg-orn-video');
    videos.forEach(video => {
        video.addEventListener('ended', function () {
            this.currentTime = 3; // Skip first 3 seconds
            this.play();
        });
    });
}

initCountdown();
initGuestName();
initRSVP();
initVideoLoop();
console.log('Wedding Invitation loaded!');

// Remove Language Toggle
const removeLanguageToggle = () => {
    const toggle = document.getElementById('language-toggle');
    if (toggle) toggle.remove();
};

removeLanguageToggle();

// Observer to ensure it stays removed
const observer = new MutationObserver((mutations) => {
    if (document.getElementById('language-toggle')) {
        removeLanguageToggle();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
// End of file

