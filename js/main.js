/* ============================================
   BRICKSTONE REALTY GROUP — main.js
   Production-optimised. Mobile-first.
   - All DOM queries cached outside handlers
   - rAF-throttled scroll (no layout thrash)
   - IntersectionObserver for reveal
   - Zero console errors/warnings
   ============================================ */

(function () {
  'use strict';

  /* ================================================
     WAIT FOR DOM
  ================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {

    /* ---- Cache all elements once ---- */
    var navbar      = document.getElementById('navbar');
    var menuToggle  = document.getElementById('menu-toggle');
    var mobileMenu  = document.getElementById('mobile-menu');
    var mobileCTA   = document.getElementById('mobile-cta');
    var heroSection = document.getElementById('hero');
    var contactForm = document.getElementById('contact-form');
    var formSuccess = document.getElementById('form-success');

    /* Pre-cache nav sections & links for scroll handler
       (avoids querySelectorAll on every scroll frame)  */
    var sections    = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
    var navLinks    = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var filterBtns  = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
    var propCards   = Array.prototype.slice.call(document.querySelectorAll('.property-card'));
    var faqBtns     = Array.prototype.slice.call(document.querySelectorAll('.faq-btn'));

    if (!navbar || !menuToggle || !mobileMenu) {
      console.warn('Brickstone: critical nav elements missing.');
      return;
    }

    /* ================================================
       SCROLL HANDLER — rAF throttled, no DOM queries
    ================================================ */
    var scrollTicking = false;
    var heroHeight    = heroSection ? heroSection.offsetHeight : 400;

    /* Recalculate heroHeight on resize (debounced) */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        heroHeight = heroSection ? heroSection.offsetHeight : 400;
      }, 150);
    }, { passive: true });

    function onScroll() {
      var y         = window.scrollY;
      var navH      = navbar.offsetHeight;
      var scrollPos = y + navH + 80;

      /* 1. Navbar scrolled state */
      navbar.classList.toggle('scrolled', y > 80);

      /* 2. Active nav link highlight */
      for (var s = 0; s < sections.length; s++) {
        var sec    = sections[s];
        var top    = sec.offsetTop;
        var bottom = top + sec.offsetHeight;
        var id     = sec.id;
        var active = (scrollPos >= top && scrollPos < bottom);
        for (var l = 0; l < navLinks.length; l++) {
          if (navLinks[l].getAttribute('href') === '#' + id) {
            navLinks[l].style.color = active ? '#C9A84C' : '';
          }
        }
      }

      /* 3. Floating mobile CTA — show after 70% of hero */
      if (mobileCTA) {
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


    /* ================================================
       MOBILE MENU
    ================================================ */
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

    /* Close on menu link tap */
    var menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    /* Close on outside tap */
    document.addEventListener('touchstart', function (e) {
      if (mobileMenu.classList.contains('open') && !navbar.contains(e.target)) {
        closeMenu();
      }
    }, { passive: true });


    /* ================================================
       SMOOTH SCROLL (with navbar offset)
    ================================================ */
    var allAnchors = document.querySelectorAll('a[href^="#"]');
    allAnchors.forEach(function (anchor) {
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


    /* ================================================
       SCROLL REVEAL — IntersectionObserver
    ================================================ */
    if ('IntersectionObserver' in window) {
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
    } else {
      /* Fallback: reveal everything immediately */
      document.querySelectorAll('.reveal-element').forEach(function (el) {
        el.classList.add('revealed');
      });
    }


    /* ================================================
       BOROUGH FILTER
    ================================================ */
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        propCards.forEach(function (card) {
          card.classList.toggle('hidden-card',
            filter !== 'all' && card.dataset.borough !== filter);
        });
      });
    });


    /* ================================================
       FAQ ACCORDION
    ================================================ */
    faqBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var answer = btn.nextElementSibling;
        var icon   = btn.querySelector('.faq-icon');
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        /* Close all others first */
        faqBtns.forEach(function (other) {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            var otherAnswer = other.nextElementSibling;
            var otherIcon   = other.querySelector('.faq-icon');
            if (otherAnswer) otherAnswer.classList.add('hidden');
            if (otherIcon)   otherIcon.classList.remove('rotated');
          }
        });

        /* Toggle this one */
        btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        if (answer) answer.classList.toggle('hidden', isOpen);
        if (icon)   icon.classList.toggle('rotated', !isOpen);
      });
    });


    /* ================================================
       HERO QUICK SEARCH
       No inline onclick — wired up via event listener
    ================================================ */
    function scrollToProperties() {
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
    }

    var heroSearchBtn = document.getElementById('hero-search-btn');
    if (heroSearchBtn) {
      heroSearchBtn.addEventListener('click', scrollToProperties);
    }


    /* ================================================
       CONTACT FORM VALIDATION
    ================================================ */
    if (!contactForm || !formSuccess) return;

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var validators = {
      name: function (v) {
        if (!v.trim())          return 'Please enter your name.';
        if (v.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      },
      email: function (v) {
        if (!v.trim())               return 'Please enter your email address.';
        if (!EMAIL_RE.test(v.trim())) return 'Please enter a valid email address.';
        return '';
      },
      message: function (v) {
        if (!v.trim())            return 'Please tell us what you need.';
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

    /* Live validation on blur (less aggressive than input) */
    ['name', 'email', 'message'].forEach(function (fieldName) {
      var field = contactForm.querySelector('#' + fieldName);
      if (!field) return;
      field.addEventListener('blur', function () {
        setFieldError(field, validators[fieldName](field.value));
      });
      field.addEventListener('input', function () {
        /* Clear error once user starts correcting */
        if (field.classList.contains('error')) {
          var err = validators[fieldName](field.value);
          if (!err) setFieldError(field, '');
        }
      });
    });

    /* Submit */
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

  } /* end init() */

}());
