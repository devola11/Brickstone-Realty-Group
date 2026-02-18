/* ============================================
   BRICKSTONE REALTY GROUP — Main JavaScript
   ============================================
   Handles:
   - Sticky navbar (transparent → solid)
   - Mobile menu (slides below navbar, never covers logo)
   - Smooth scrolling with nav offset
   - Scroll-reveal (Intersection Observer)
   - Active nav link highlighting
   - Borough filter for property cards
   - FAQ accordion
   - Hero quick-search scroll
   - Contact form validation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  const navbar      = document.getElementById('navbar');
  const menuToggle  = document.getElementById('menu-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const revealEls   = document.querySelectorAll('.reveal-element');
  const sections    = document.querySelectorAll('section[id]');
  const navLinks    = document.querySelectorAll('.nav-link');


  // ----------------------------------------
  // SCROLL HANDLER (rAF-throttled)
  // ----------------------------------------
  let scrollTicking = false;

  const onScroll = () => {
    // Navbar solid/transparent
    navbar.classList.toggle('scrolled', window.scrollY > 80);

    // Active nav link
    const scrollPos = window.scrollY + navbar.offsetHeight + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = (scrollPos >= top && scrollPos < bottom) ? '#C9A84C' : '';
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

  onScroll(); // run once on load


  // ----------------------------------------
  // MOBILE MENU
  // The panel slides DOWN below the <nav> bar,
  // so the logo and hamburger are never covered.
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

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
  });


  // ----------------------------------------
  // SMOOTH SCROLLING (with navbar offset)
  // ----------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight     = navbar.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
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
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));


  // ----------------------------------------
  // BOROUGH FILTER (property cards)
  // ----------------------------------------
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const propertyCards = document.querySelectorAll('.property-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Toggle active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide cards
      propertyCards.forEach(card => {
        if (filter === 'all' || card.dataset.borough === filter) {
          card.classList.remove('hidden-card');
        } else {
          card.classList.add('hidden-card');
        }
      });
    });
  });


  // ----------------------------------------
  // FAQ ACCORDION
  // ----------------------------------------
  const faqBtns = document.querySelectorAll('.faq-btn');

  faqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const answer   = btn.nextElementSibling;
      const icon     = btn.querySelector('.faq-icon');
      const isOpen   = btn.getAttribute('aria-expanded') === 'true';

      // Close all other open items
      faqBtns.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.classList.add('hidden');
          otherBtn.querySelector('.faq-icon').classList.remove('rotated');
        }
      });

      // Toggle this one
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.classList.add('hidden');
        icon.classList.remove('rotated');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.remove('hidden');
        icon.classList.add('rotated');
      }
    });
  });


  // ----------------------------------------
  // HERO QUICK SEARCH — scroll to properties
  // ----------------------------------------
  window.scrollToProperties = () => {
    const propertiesSection = document.getElementById('properties');
    const boroughVal = document.getElementById('borough-select').value;

    if (propertiesSection) {
      const navHeight = navbar.offsetHeight;
      const top = propertiesSection.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });

      // If a borough was selected, trigger the matching filter button
      if (boroughVal) {
        setTimeout(() => {
          const matchingBtn = document.querySelector(`.filter-btn[data-filter="${boroughVal}"]`);
          if (matchingBtn) matchingBtn.click();
        }, 600); // wait for scroll to settle
      }
    }
  };


  // ----------------------------------------
  // CONTACT FORM VALIDATION
  // ----------------------------------------
  const validators = {
    name: (v) => {
      if (!v.trim()) return 'Please enter your name.';
      if (v.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email address.';
      return '';
    },
    message: (v) => {
      if (!v.trim()) return 'Please enter a message.';
      if (v.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    }
  };

  const setFieldError = (field, message) => {
    const group   = field.closest('.form-group');
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

  let successTimeout = null;

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
      const firstError = contactForm.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Success state
    contactForm.reset();
    formSuccess.classList.remove('hidden');
    formSuccess.classList.add('show');

    if (successTimeout) clearTimeout(successTimeout);
    successTimeout = setTimeout(() => {
      formSuccess.classList.add('hidden');
      formSuccess.classList.remove('show');
    }, 6000);
  });

});
