// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({ duration: 1000, once: true });
});

// Hero Slider Logic
let idx = 0;
const slides = document.querySelectorAll('.hero-slide');
if(slides.length > 1) {
    setInterval(() => {
        slides[idx].classList.remove('active');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add('active');
    }, 5000);
}

// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navList = document.getElementById('nav-list');
mobileMenu.addEventListener('click', () => {
    navList.classList.toggle('active');
    const icon = mobileMenu.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// *** ENHANCED HEADER DISAPPEAR ON SCROLL ***
let lastScrollTop = 0;
const header = document.getElementById('main-header');
const hero = document.getElementById('hero');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Header disappears completely after 200px scroll
    if (scrollTop > 200) {
        header.classList.add('disappearing');
    } else {
        header.classList.remove('disappearing');
    }
    
    // Optional: Scroll direction sensitivity (hides on scroll down, shows on scroll up)
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.classList.add('disappearing');
    } else if (scrollTop < 50) {
        header.classList.remove('disappearing');
    }
    
    lastScrollTop = scrollTop;
});
