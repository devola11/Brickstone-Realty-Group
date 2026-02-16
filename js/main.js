/* ============================================
   BRICKSTONE REALTY GROUP — Main JavaScript
   ============================================
   Handles:
   - Sticky navigation with transparent/solid transition
   - Mobile menu toggle with ARIA + Escape key
   - Smooth scrolling (with nav offset)
   - Scroll-reveal animations (Intersection Observer)
   - Active nav link highlighting
   - Contact form validation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const revealElements = document.querySelectorAll('.reveal-element');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');


  // ----------------------------------------
  // SCROLL HANDLER (rAF-throttled, combined)
  // Merges: navbar transition + active nav highlighting
  // ----------------------------------------
  let scrollTicking = false;

  const onScroll = () => {
    // Navbar solid/transparent
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link highlighting
    const scrollPos = window.scrollY + navbar.offsetHeight + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          if (scrollPos >= top && scrollPos < bottom) {
            link.style.color = '#C9A84C';
          } else {
            link.style.color = '';
          }
        }
      });
    });

    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  onScroll(); // Run on load


  // ----------------------------------------
  // MOBILE MENU
  // ----------------------------------------
  const openMenu = () => {
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
  });


  // ----------------------------------------
  // SMOOTH SCROLLING (with sticky nav offset)
  // ----------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = navbar.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });


  // ----------------------------------------
  // SCROLL REVEAL (Intersection Observer)
  // ----------------------------------------
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));


  // ----------------------------------------
  // CONTACT FORM VALIDATION
  // ----------------------------------------
  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Please enter your name.';
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Please enter your email address.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
      return '';
    },
    message: (value) => {
      if (!value.trim()) return 'Please enter a message.';
      if (value.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    }
  };

  const setFieldError = (field, message) => {
    const group = field.closest('.form-group');
    const errorEl = group.querySelector('.error-message');

    if (message) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.classList.add('visible');
      errorEl.classList.remove('hidden');
    } else {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
      errorEl.classList.add('hidden');
    }
  };

  // Live validation: clear errors as user types
  ['name', 'email', 'message'].forEach(fieldName => {
    const field = contactForm.querySelector(`#${fieldName}`);
    field.addEventListener('input', () => {
      const error = validators[fieldName](field.value);
      if (!error) setFieldError(field, '');
    });
  });

  // Track success timeout to prevent stacking
  let successTimeout = null;

  // Form submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasErrors = false;

    ['name', 'email', 'message'].forEach(fieldName => {
      const field = contactForm.querySelector(`#${fieldName}`);
      const error = validators[fieldName](field.value);
      setFieldError(field, error);
      if (error) hasErrors = true;
    });

    if (hasErrors) {
      // Focus the first field with an error
      const firstError = contactForm.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Success
    contactForm.reset();
    formSuccess.classList.remove('hidden');
    formSuccess.classList.add('show');

    // Clear any existing timeout
    if (successTimeout) clearTimeout(successTimeout);

    successTimeout = setTimeout(() => {
      formSuccess.classList.add('hidden');
      formSuccess.classList.remove('show');
    }, 5000);
  });

});
