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

// *** DYNAMIC MOBILE MENU TOGGLE WITH ANIMATIONS ***
const mobileMenu = document.getElementById('mobile-menu');
const navList = document.getElementById('nav-list');
const menuIcon = mobileMenu.querySelector('i');

mobileMenu.addEventListener('click', function() {
    // Toggle menu visibility
    navList.classList.toggle('active');
    
    // Animate hamburger to X transformation
    if (navList.classList.contains('active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
        mobileMenu.classList.add('active');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
        mobileMenu.classList.remove('active');
    }
    
    // Close menu when clicking on a link
    const navLinks = navList.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
            mobileMenu.classList.remove('active');
        });
    });
});

// *** ENHANCED HEADER DISAPPEAR ON SCROLL ***
let lastScrollTop = 0;
const header = document.getElementById('main-header');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 200) {
        header.classList.add('disappearing');
    } else {
        header.classList.remove('disappearing');
    }
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.classList.add('disappearing');
    } else if (scrollTop < 50) {
        header.classList.remove('disappearing');
    }
    
    lastScrollTop = scrollTop;
});
