// Cookie Banner
(function() {
    const banner = document.getElementById('cookieBanner');
    const stored = localStorage.getItem('cookieConsent');
    if (!stored) {
        banner.hidden = false;
    }
    document.getElementById('cookieAccept').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        banner.hidden = true;
    });
    document.getElementById('cookieReject').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'rejected');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        banner.hidden = true;
    });
})();

// Booking Form Handler
document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dates: formData.get('dates'),
        people: formData.get('people'),
        message: formData.get('message'),
        consent: formData.get('consent') === 'on',
        marketing: formData.get('marketing') === 'on',
        consentTimestamp: new Date().toISOString(),
        src: new URLSearchParams(window.location.search).get('src') || ''
    };

    // Get form message element
    const formMessage = document.getElementById('formMessage');
    const submitButton = this.querySelector('.submit-button');

    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        // Send to API endpoint
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to submit');
        }

        // Show success message
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Thank you for your booking request! We will contact you within 24 hours.';

        // Reset form
        this.reset();

        // Re-enable button
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Booking Request';
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Sorry, there was an error sending your request. Please try again or contact us directly at +386 51 362 390.';

        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Booking Request';
    }
});

// Smooth scroll for CTA button
document.querySelector('.cta-button').addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('#booking').scrollIntoView({
        behavior: 'smooth'
    });
});

// Optional: Add animation on scroll
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

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Hero is always visible
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'translateY(0)';

// Apartment Gallery Lightbox
(function() {
    const photos = [
        { src: 'images/stay-living.jpg', alt: 'Living and dining area' },
        { src: 'images/stay-dining.jpg', alt: 'Dining table' },
        { src: 'images/stay-lounge.jpg', alt: 'Lounge area' },
        { src: 'images/stay-kitchen.jpg', alt: 'Kitchen' },
        { src: 'images/stay-bedroom1.jpg', alt: 'Double bedroom' },
        { src: 'images/stay-bedroom2.jpg', alt: 'Twin bedroom' },
        { src: 'images/stay-rustic2.jpg', alt: 'Double bedroom' },
        { src: 'images/stay-bedroom3.jpg', alt: 'Attic bedroom with beams' },
        { src: 'images/stay-rustic1.jpg', alt: 'Attic bedroom with beams' },
        { src: 'images/stay-attic.jpg', alt: 'Attic twin bedroom' },
        { src: 'images/stay-bathroom.jpg', alt: 'Bathroom with shower' },
        { src: 'images/stay-bath2.jpg', alt: 'Bathroom' }
    ];

    const trigger = document.getElementById('apartmentsTrigger');
    const lightbox = document.getElementById('lightbox');
    if (!trigger || !lightbox) return;

    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    let current = 0;

    function show(i) {
        current = (i + photos.length) % photos.length;
        img.src = photos[current].src;
        img.alt = photos[current].alt;
        counter.textContent = (current + 1) + ' / ' + photos.length;
    }

    function open() {
        show(0);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lightbox.hidden = true;
        document.body.style.overflow = '';
    }

    trigger.addEventListener('click', open);
    trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    document.getElementById('lightboxClose').addEventListener('click', close);
    document.getElementById('lightboxNext').addEventListener('click', () => show(current + 1));
    document.getElementById('lightboxPrev').addEventListener('click', () => show(current - 1));

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function(e) {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') show(current + 1);
        if (e.key === 'ArrowLeft') show(current - 1);
    });
})();

// Engagement beacon (anonymous, no cookies, no identifiers)
(function() {
    let start = performance.now();
    let elapsed = 0;
    let running = true;
    let maxDepth = 0;
    let sent = false;

    // Sections in DOM order; deepest-seen index wins so a user who scrolls
    // past a section and back up still gets credited for the deepest point
    const sections = Array.from(document.querySelectorAll('section'));
    let deepestSectionIndex = -1;

    if (sections.length) {
        const sectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const index = sections.indexOf(entry.target);
                if (index > deepestSectionIndex) {
                    deepestSectionIndex = index;
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    function updateDepth() {
        const doc = document.documentElement;
        const scrollHeight = doc.scrollHeight;
        if (!scrollHeight) return;
        const percent = ((window.scrollY + window.innerHeight) / scrollHeight) * 100;
        maxDepth = Math.max(maxDepth, Math.min(100, Math.max(0, percent)));
    }

    window.addEventListener('scroll', updateDepth, { passive: true });
    updateDepth();

    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            if (running) {
                elapsed += performance.now() - start;
                running = false;
            }
            sendBeacon();
        } else if (document.visibilityState === 'visible') {
            start = performance.now();
            running = true;
        }
    });

    window.addEventListener('pagehide', function() {
        if (running) {
            elapsed += performance.now() - start;
            running = false;
        }
        sendBeacon();
    });

    function getLocale() {
        const path = window.location.pathname;
        if (path.indexOf('/hu') === 0) return 'hu';
        if (path.indexOf('/hr') === 0) return 'hr';
        return 'en';
    }

    function sendBeacon() {
        if (sent) return;
        if (!navigator.sendBeacon) return;

        const seconds = Math.floor(elapsed / 1000);
        if (seconds < 1) return;

        sent = true;

        const sectionLabel = deepestSectionIndex >= 0
            ? (sections[deepestSectionIndex].classList[0] || 'unknown')
            : 'unknown';

        let referrerHost = '';
        try {
            if (document.referrer) referrerHost = new URL(document.referrer).hostname;
        } catch (e) { /* malformed referrer, leave empty */ }

        const payload = {
            t: seconds,
            d: Math.round(maxDepth),
            s: sectionLabel,
            l: getLocale(),
            src: new URLSearchParams(window.location.search).get('src') || '',
            r: referrerHost
        };

        navigator.sendBeacon('/api/beacon', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    }
})();
