/* ============================================
   BRICKSTONE REALTY GROUP — main.js
   No console errors. Mobile-first optimised.
   ============================================ */

(function () {
  'use strict';
  /* ---- cached elements ---- */
  var navbar      = document.getElementById('navbar');
  var menuToggle  = document.getElementById('menu-toggle');
  var mobileMenu  = document.getElementById('mobile-menu');
  var mobileCTA   = document.getElementById('mobile-cta');
  var contactForm = document.getElementById('contact-form');
  var formSuccess = document.getElementById('form-success');

  if (!navbar || !menuToggle || !mobileMenu) {
    console.warn('Brickstone: critical nav elements missing.');
    return;
  }

  /* ---- SCROLL HANDLER (throttled with rAF) ---- */
  var scrollTicking = false;

  function onScroll() {
    var y = window.scrollY;

    /* navbar state */
    navbar.classList.toggle('scrolled', y > 80);

    /* active nav link */
    var scrollPos = y + navbar.offsetHeight + 80;
    document.querySelectorAll('section[id]').forEach(function (sec) {
      var top    = sec.offsetTop;
      var bottom = top + sec.offsetHeight;
      var id     = sec.getAttribute('id');
      document.querySelectorAll('.nav-link').forEach(function (link) {
        if (link.getAttribute('href') === '#' + id) {
          link.style.color = (scrollPos >= top && scrollPos < bottom) ? '#C9A84C' : '';
        }
      });
    });

    /* floating mobile CTA — show after hero */
    if (mobileCTA) {
      var heroHeight = (document.getElementById('hero') || {}).offsetHeight || 400;
      mobileCTA.classList.toggle('visible', y > heroHeight * 0.7);
    }

    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  onScroll(); /* run once on load */


  /* ---- MOBILE MENU ---- */
  function openMenu() {
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', function () {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  /* close on link tap */
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  /* close on outside tap */
  document.addEventListener('touchstart', function (e) {
    if (mobileMenu.classList.contains('open') &&
        !navbar.contains(e.target)) {
      closeMenu();
    }
  }, { passive: true });


  /* ---- SMOOTH SCROLL (with nav offset) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var offset = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });


  /* ---- SCROLL REVEAL ---- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  document.querySelectorAll('.reveal-element').forEach(function (el) {
    revealObserver.observe(el);
  });


  /* ---- BOROUGH FILTER ---- */
  var filterBtns    = document.querySelectorAll('.filter-btn');
  var propertyCards = document.querySelectorAll('.property-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      propertyCards.forEach(function (card) {
        card.classList.toggle('hidden-card',
          filter !== 'all' && card.dataset.borough !== filter);
      });
    });
  });


  /* ---- FAQ ACCORDION ---- */
  document.querySelectorAll('.faq-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = btn.nextElementSibling;
      var icon   = btn.querySelector('.faq-icon');
      var isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* close all others */
      document.querySelectorAll('.faq-btn').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var otherAnswer = other.nextElementSibling;
          var otherIcon   = other.querySelector('.faq-icon');
          if (otherAnswer) otherAnswer.classList.add('hidden');
          if (otherIcon)   otherIcon.classList.remove('rotated');
        }
      });

      /* toggle this */
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (answer) answer.classList.toggle('hidden', isOpen);
      if (icon)   icon.classList.toggle('rotated', !isOpen);
    });
  });


  /* ---- HERO QUICK SEARCH ---- */
  window.scrollToProperties = function () {
    var target = document.getElementById('properties');
    if (!target) return;
    var offset = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
    window.scrollTo({ top: offset, behavior: 'smooth' });

    var boroughVal = (document.getElementById('borough-select') || {}).value;
    if (boroughVal) {
      setTimeout(function () {
        var btn = document.querySelector('.filter-btn[data-filter="' + boroughVal + '"]');
        if (btn) btn.click();
      }, 650);
    }
  };


  /* ---- CONTACT FORM VALIDATION ---- */
  if (!contactForm || !formSuccess) return;

  var validators = {
    name: function (v) {
      if (!v.trim()) return 'Please enter your name.';
      if (v.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email.';
      return '';
    },
    message: function (v) {
      if (!v.trim()) return 'Please enter a message.';
      if (v.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    }
  };

  function setFieldError(field, msg) {
    var group   = field.closest('.form-group');
    if (!group) return;
    var errorEl = group.querySelector('.error-message');
    if (!errorEl) return;
    if (msg) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      errorEl.textContent = msg;
      errorEl.classList.add('visible');
      errorEl.classList.remove('hidden');
    } else {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
      errorEl.classList.add('hidden');
    }
  }

  /* live validation */
  ['name', 'email', 'message'].forEach(function (fieldName) {
    var field = contactForm.querySelector('#' + fieldName);
    if (!field) return;
    field.addEventListener('input', function () {
      var err = validators[fieldName](field.value);
      if (!err) setFieldError(field, '');
    });
  });

  /* submit */
  var successTimer = null;
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var hasErrors = false;
    ['name', 'email', 'message'].forEach(function (fieldName) {
      var field = contactForm.querySelector('#' + fieldName);
      if (!field) return;
      var err = validators[fieldName](field.value);
      setFieldError(field, err);
      if (err) hasErrors = true;
    });
    if (hasErrors) {
      var firstErr = contactForm.querySelector('.error');
      if (firstErr) firstErr.focus();
      return;
    }
    contactForm.reset();
    formSuccess.classList.remove('hidden');
    formSuccess.classList.add('show');
    if (successTimer) clearTimeout(successTimer);
    successTimer = setTimeout(function () {
      formSuccess.classList.add('hidden');
      formSuccess.classList.remove('show');
    }, 6000);
  });

}());
