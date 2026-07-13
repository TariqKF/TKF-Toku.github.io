document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // 1. Theme Toggle Management
    const themeToggleBtn = document.getElementById("theme-toggle");
    
    // Check saved theme or preference
    const savedTheme = localStorage.getItem("theme");
    const userPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "light" || (!savedTheme && !userPrefersDark)) {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
    }

    themeToggleBtn.addEventListener("click", () => {
        if (document.body.classList.contains("dark-theme")) {
            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
            localStorage.setItem("theme", "light");
        } else {
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    const toggleMobileMenu = () => {
        navMenu.classList.toggle("active");
        const isOpen = navMenu.classList.contains("active");
        mobileMenuToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
        lucide.createIcons();
    };

    mobileMenuToggle.addEventListener("click", toggleMobileMenu);

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu.classList.contains("active")) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (navMenu.classList.contains("active") && 
            !navMenu.contains(e.target) && 
            !mobileMenuToggle.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // 3. Header Scrolled State
    const header = document.getElementById("main-header");
    const checkHeaderScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };
    
    window.addEventListener("scroll", checkHeaderScroll);
    checkHeaderScroll(); // Run on init

    // 4. Projects Category Filter & Accordion
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectAccordionItems = document.querySelectorAll(".project-accordion-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Update active filter button class
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");

            projectAccordionItems.forEach(item => {
                const category = item.getAttribute("data-category");
                const content = item.querySelector(".project-accordion-content");
                
                // Collapse active item when filtering
                item.classList.remove("active");
                content.style.maxHeight = null;
                
                // Transition opacity/scale
                item.style.opacity = "0";
                
                setTimeout(() => {
                    let isMatch = false;
                    if (filterValue === "all") {
                        isMatch = true;
                    } else if (filterValue === "pcb" && category === "pcb") {
                        isMatch = true;
                    } else if (filterValue === "embedded" && (category === "embedded" || category === "pcb")) {
                        isMatch = (category === "pcb" && item.getAttribute("data-project-id") === "2") || category === "embedded";
                    } else if (filterValue === "robotics" && category === "robotics") {
                        isMatch = true;
                    }

                    if (isMatch) {
                        item.style.display = "block";
                        setTimeout(() => {
                            item.style.opacity = "1";
                        }, 50);
                    } else {
                        item.style.display = "none";
                    }
                }, 200);
            });
        });
    });

    // 5. Accordion Interactivity
    const accordionHeaders = document.querySelectorAll(".project-accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const currentItem = header.parentElement;
            const content = currentItem.querySelector(".project-accordion-content");
            const isActive = currentItem.classList.contains("active");

            // Close all other items
            projectAccordionItems.forEach(item => {
                if (item !== currentItem && item.classList.contains("active")) {
                    item.classList.remove("active");
                    item.querySelector(".project-accordion-content").style.maxHeight = null;
                }
            });

            // Toggle current item
            if (isActive) {
                currentItem.classList.remove("active");
                content.style.maxHeight = null;
            } else {
                currentItem.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // 6. Scroll Reveal Animation using IntersectionObserver
    const revealElements = document.querySelectorAll(".scroll-reveal");
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 7. Contact Form Handling & Validation
    const contactForm = document.getElementById("contact-form");
    const formSuccessOverlay = document.getElementById("form-success");
    const resetFormBtn = document.getElementById("reset-form-btn");
    const submitBtn = document.getElementById("submit-btn");

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    };

    const validateField = (input) => {
        const formGroup = input.parentElement;
        let isValid = true;

        if (input.required && !input.value.trim()) {
            isValid = false;
        } else if (input.type === "email" && !validateEmail(input.value)) {
            isValid = false;
        }

        if (isValid) {
            formGroup.classList.remove("invalid");
        } else {
            formGroup.classList.add("invalid");
        }

        return isValid;
    };

    // Live validation triggers
    const formInputs = contactForm.querySelectorAll("input, textarea");
    formInputs.forEach(input => {
        input.addEventListener("input", () => {
            if (input.parentElement.classList.contains("invalid")) {
                validateField(input);
            }
        });
        
        input.addEventListener("blur", () => {
            validateField(input);
        });
    });

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        formInputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // Set sending status
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span><i data-lucide="loader" class="animate-spin"></i>`;
            lucide.createIcons();

            // Simulate form submission delay
            setTimeout(() => {
                formSuccessOverlay.classList.add("active");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                contactForm.reset();
                formInputs.forEach(input => input.parentElement.classList.remove("invalid"));
            }, 1500);
        }
    });

    resetFormBtn.addEventListener("click", () => {
        formSuccessOverlay.classList.remove("active");
    });

    // 8. Back to Top Button
    const backToTopBtn = document.getElementById("back-to-top");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            backToTopBtn.style.opacity = "1";
            backToTopBtn.style.pointerEvents = "auto";
        } else {
            backToTopBtn.style.opacity = "0";
            backToTopBtn.style.pointerEvents = "none";
        }
    });
    
    // Set initial back to top state
    backToTopBtn.style.opacity = "0";
    backToTopBtn.style.pointerEvents = "none";
    backToTopBtn.style.transition = "opacity var(--transition-fast)";

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});
