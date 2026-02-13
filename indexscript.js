// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
  AOS.init({ duration: 1000, once: true });
});

// Hero Slider Logic
let idx = 0;
const slides = document.querySelectorAll('.hero-slide');
if (slides.length > 1) {
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


// Dynamic scroll effect for floating icons
window.addEventListener('scroll', function() {
  const emailBtn = document.querySelector('.email-fixed');
  const scrollPosition = window.scrollY;
  
  if (scrollPosition > 300) {
    emailBtn.style.opacity = "1";
    emailBtn.style.visibility = "visible";
  } else {
    // Optional: Hide it when at the very top of the page
    // emailBtn.style.opacity = "0.7"; 
  }
});

// Stats counter animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        const count = { val: 0 };
        
        const updateCount = () => {
            count.val += target / 100;
            if (count.val < target) {
                stat.textContent = Math.floor(count.val) + (target > 100 ? '+' : '');
                requestAnimationFrame(updateCount);
            } else {
                stat.textContent = target + (target > 100 ? '+' : '');
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(stat);
    });
}

// Initialize stats animation when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    animateStats();
    
    // Re-run animation on scroll to top (for SPA navigation)
    window.addEventListener('scroll', () => {
        const statsSection = document.getElementById('stats');
        if (statsSection && window.scrollY === 0) {
            setTimeout(animateStats, 100);
        }
    });
});
