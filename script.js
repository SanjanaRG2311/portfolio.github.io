// DOM Elements
const nav = document.querySelector('nav');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');
const backToTopBtn = document.getElementById('backToTop');
const currentYear = document.getElementById('current-year');
const form = document.querySelector('.contact-form');
const heroSection = document.querySelector('.hero');
const body = document.body;

// Initialize all animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
    
    // Initialize all effects
    initNeuralNetwork();
    initRoboticHand();
    initFloatingOrbs();
    initScrollAnimations();
    
    // Add glitch effect to headings on hover
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        heading.addEventListener('mouseenter', () => {
            heading.style.animation = 'glitch 0.3s linear';
            setTimeout(() => {
                heading.style.animation = '';
            }, 300);
        });
    });
    
    // Add hover effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            button.style.setProperty('--x', `${x}px`);
            button.style.setProperty('--y', `${y}px`);
            button.style.setProperty('--opacity', '1');
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.setProperty('--opacity', '0');
        });
    });
    
    // Initialize particles.js if element exists
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#2563eb'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#2563eb',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
    
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
});

// Navbar scroll effect with parallax
window.addEventListener('scroll', () => {
    // Navbar scroll effect
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    // Show/hide back to top button
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
    
    // Parallax effect for hero section
    const scrollPosition = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrollPosition * 0.2}px)`;
    }
    
    // Animate elements on scroll
    animateOnScroll();
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Smooth scrolling for anchor links with animation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            this.appendChild(ripple);
            
            // Position the ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size/2}px`;
            ripple.style.top = `${e.clientY - rect.top - size/2}px`;
            
            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 600);
            
            // Smooth scroll to target
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Back to top button
backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Form submission
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Here you would typically send the form data to a server
        console.log('Form submitted:', formObject);
        
        // Show success message
        alert('Thank you for your message! I will get back to you soon.');
        form.reset();
    });
}

// Initialize Neural Network Animation
function initNeuralNetwork() {
    const container = document.createElement('div');
    container.className = 'neural-network';
    document.body.appendChild(container);
    
    // Create nodes
    const nodeCount = 15;
    const nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'node';
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        container.appendChild(node);
        nodes.push({
            element: node,
            x: parseFloat(node.style.left),
            y: parseFloat(node.style.top),
            vx: Math.random() * 0.5 - 0.25,
            vy: Math.random() * 0.5 - 0.25
        });
    }
    
    // Create connections
    const connections = [];
    nodes.forEach((node1, i) => {
        nodes.slice(i + 1).forEach(node2 => {
            if (Math.random() > 0.7) {
                const connection = document.createElement('div');
                connection.className = 'connection';
                container.appendChild(connection);
                connections.push({ node1, node2, element: connection });
            }
        });
    });
    
    // Animate
    function update() {
        nodes.forEach(node => {
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges
            if (node.x < 0 || node.x > 100) node.vx *= -1;
            if (node.y < 0 || node.y > 100) node.vy *= -1;
            
            // Apply to DOM
            node.element.style.left = `${node.x}%`;
            node.element.style.top = `${node.y}%`;
        });
        
        // Update connections
        connections.forEach(conn => {
            const x1 = conn.node1.x * window.innerWidth / 100;
            const y1 = conn.node1.y * window.innerHeight / 100;
            const x2 = conn.node2.x * window.innerWidth / 100;
            const y2 = conn.node2.y * window.innerHeight / 100;
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            conn.element.style.width = `${length}px`;
            conn.element.style.left = `${x1}px`;
            conn.element.style.top = `${y1}px`;
            conn.element.style.transform = `rotate(${angle}deg)`;
            conn.element.style.opacity = Math.min(1, 1000 / length);
        });
        
        requestAnimationFrame(update);
    }
    
    update();
}

// Initialize Robotic Hand Animation
function initRoboticHand() {
    const handContainer = document.createElement('div');
    handContainer.className = 'robotic-hand';
    document.body.appendChild(handContainer);
    
    // Create hand parts
    const parts = [
        { width: '60px', height: '100px', x: '50%', y: '20%', angle: 0 },
        { width: '40px', height: '80px', x: '50%', y: '35%', angle: 10 },
        { width: '30px', height: '60px', x: '50%', y: '50%', angle: -5 },
        { width: '25px', height: '50px', x: '50%', y: '60%', angle: 5 },
        { width: '20px', height: '40px', x: '50%', y: '70%', angle: -3 }
    ];
    
    parts.forEach((part, i) => {
        const partEl = document.createElement('div');
        partEl.className = 'hand-part';
        partEl.style.width = part.width;
        partEl.style.height = part.height;
        partEl.style.left = part.x;
        partEl.style.top = part.y;
        partEl.style.transform = `translate(-50%, -50%) rotate(${part.angle}deg)`;
        handContainer.appendChild(partEl);
        
        // Animate
        setInterval(() => {
            const newAngle = Math.sin(Date.now() * 0.001 + i) * 10;
            partEl.style.transform = `translate(-50%, -50%) rotate(${part.angle + newAngle}deg)`;
        }, 16);
    });
}

// Initialize Floating Orbs
function initFloatingOrbs() {
    const orbCount = 5;
    
    for (let i = 0; i < orbCount; i++) {
        const orb = document.createElement('div');
        orb.className = 'glowing-orb';
        orb.style.left = `${10 + Math.random() * 80}%`;
        orb.style.top = `${10 + Math.random() * 80}%`;
        orb.style.animationDelay = `${Math.random() * 5}s`;
        document.body.appendChild(orb);
    }
}


// Initialize Scroll Animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.skill-card, .project-card, .timeline-item, .education-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Animate elements on scroll
function animateOnScroll() {
    document.querySelectorAll('.skill-card, .project-card, .timeline-item, .education-item').forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight * 0.8) && (rect.bottom >= window.innerHeight * 0.2);
        
        if (isVisible) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

// Add hover effect to project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    const image = card.querySelector('img');
    const content = card.querySelector('.project-content');
    
    card.addEventListener('mouseenter', () => {
        if (image) image.style.transform = 'scale(1.05)';
        if (content) content.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
    });
    
    card.addEventListener('mouseleave', () => {
        if (image) image.style.transform = 'scale(1)';
        if (content) content.style.backgroundColor = 'var(--card-bg)';
    });
});

// Add loading animation for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.onload = () => {
                    img.style.opacity = '1';
                };
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease-in-out';
    });
});

// Add animation to timeline items
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

timelineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = index % 2 === 0 ? 'translateX(-20px)' : 'translateX(20px)';
    item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    timelineObserver.observe(item);
});

// Add animation to education items
const educationItems = document.querySelectorAll('.education-item');
const educationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

educationItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    educationObserver.observe(item);
});
