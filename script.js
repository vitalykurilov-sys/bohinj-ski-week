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
        message: formData.get('message')
    };

    // Get form message element
    const formMessage = document.getElementById('formMessage');
    const submitButton = this.querySelector('.submit-button');

    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        // Format email body
        const emailBody = `
New Booking Request - Learn to Ski in Bohinj

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Preferred Dates: ${data.dates || 'Not specified'}
Number of People: ${data.people}

Message:
${data.message || 'No additional message'}

---
Sent from: learntoskibohinj.com
Date: ${new Date().toLocaleString()}
        `;

        // For now, we'll create a mailto link
        // In production, you should use a backend service like Formspree, EmailJS, or your own API
        const mailtoLink = `mailto:spo.youtravel@gmail.com?subject=Booking Request - ${data.name}&body=${encodeURIComponent(emailBody)}`;

        // Show success message
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Thank you for your booking request! We will contact you within 24 hours. Opening email client...';

        // Open mailto link after a short delay
        setTimeout(() => {
            window.location.href = mailtoLink;
        }, 1000);

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
