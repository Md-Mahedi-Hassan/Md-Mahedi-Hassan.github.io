// Array to hold the current slide index for each slideshow category
let slideIndices = [];
let slideTimers = []; // To store setInterval IDs for each slideshow

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links (only for internal links on the same page)
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if the link points to an ID on the current page
            const currentPath = window.location.pathname.split('/').pop();
            const targetPath = this.getAttribute('href').split('/').pop().split('#')[0]; // Get filename without hash

            if (currentPath === targetPath || (currentPath === '' && targetPath === 'index.html')) {
                const targetId = this.getAttribute('href').split('#')[1];
                if (targetId) { // Only smooth scroll if there's an ID
                    e.preventDefault();
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        const headerOffset = document.querySelector('.header').offsetHeight; // Get header height
                        const elementPosition = targetSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // -20 for extra space

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            }

            // Close mobile menu if open (applies to all links)
            const mobileMenu = document.getElementById('mobile-menu');
            const navLinks = document.querySelector('.nav-links');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    });

    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) { // Ensure elements exist before adding listeners
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }


    // Typing effect for hero section (only on index.html)
    const typingElement = document.querySelector('.typing-effect');
    if (typingElement) { // Check if the element exists (i.e., we are on index.html)
        const texts = ["Lecturer at Daffodil International University", "Aspiring PhD in Deep Learning & AI", "Researcher in Machine Learning & Computer Vision"];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100; // milliseconds per character

        function type() {
            const currentText = texts[textIndex];
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentText.length) {
                // Pause at end of text
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 100;
            } else {
                typingSpeed = 100;
            }

            setTimeout(type, typingSpeed);
        }

        // Start typing effect after a small delay
        setTimeout(type, 500);
    }


    // Add sticky class to header on scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > header.offsetHeight) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }


    // Intersection Observer for scroll animations (optional, for more advanced effects)
    // Applies to all sections on all pages
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        threshold: 0.2, // When 20% of the section is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in'); // Add a class for animation
            } else {
                entry.target.classList.remove('fade-in'); // Remove when out of view
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.classList.add('hidden'); // Initially hide for fade-in effect
        observer.observe(section);
    });

    // Dark/Light Mode Toggle
    const modeToggleBtn = document.getElementById('mode-toggle');
    const body = document.body;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        if (savedTheme === 'light-mode') {
            modeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            modeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    } else {
        // Default to dark mode if no preference is saved
        body.classList.add('dark-mode'); // Ensure dark-mode class is present for initial state
        modeToggleBtn.querySelector('i').classList.add('fa-moon');
    }


    modeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            modeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            modeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // --- Slideshow Logic for Photo Gallery ---
    const slideshowContainers = document.querySelectorAll('.slideshow-container');

    if (slideshowContainers.length > 0) {
        slideshowContainers.forEach((container, index) => {
            slideIndices[index] = 1; // Initialize first slide for each category
            showSlides(1, index); // Show the first slide for each category
            startAutoSlideshow(index); // Start auto-play for each category
        });
    }

    // Next/previous controls
    window.plusSlides = function(n, categoryIndex) {
        showSlides(slideIndices[categoryIndex] += n, categoryIndex);
        resetAutoSlideshow(categoryIndex); // Reset timer on manual interaction
    }

    // Thumbnail image controls
    window.currentSlide = function(n, categoryIndex) {
        showSlides(slideIndices[categoryIndex] = n, categoryIndex);
        resetAutoSlideshow(categoryIndex); // Reset timer on manual interaction
    }

    function showSlides(n, categoryIndex) {
        let i;
        let slides = slideshowContainers[categoryIndex].querySelectorAll('.mySlides');
        let dots = document.querySelectorAll(`.slideshow-container[data-category-index="${categoryIndex}"] + .dot-container .dot`);

        if (n > slides.length) { slideIndices[categoryIndex] = 1 }
        if (n < 1) { slideIndices[categoryIndex] = slides.length }

        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active-dot", "");
        }
        slides[slideIndices[categoryIndex]-1].style.display = "block";
        if (dots.length > 0) { // Ensure dots exist before trying to access
            dots[slideIndices[categoryIndex]-1].className += " active-dot";
        }
    }

    function startAutoSlideshow(categoryIndex) {
        // Clear any existing timer for this category
        if (slideTimers[categoryIndex]) {
            clearInterval(slideTimers[categoryIndex]);
        }
        // Set a new timer
        slideTimers[categoryIndex] = setInterval(() => {
            plusSlides(1, categoryIndex);
        }, 6000); // Change image every 6 seconds
    }

    function resetAutoSlideshow(categoryIndex) {
        clearInterval(slideTimers[categoryIndex]);
        startAutoSlideshow(categoryIndex);
    }
});
