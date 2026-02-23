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
      return;
    }

    /* ================================================
       SCROLL HANDLER — rAF throttled, no DOM queries
    ================================================ */
    var scrollTicking = false;

    /* Pre-cache all layout values that onScroll reads — eliminates forced reflow on every frame.
       Initialise with safe fallbacks; cacheLayout() on window.load fills accurate values before
       any user scroll. Avoids layout reads during the DOMContentLoaded task (saves TBT). */
    var navH       = 64;   /* fallback; real value set by cacheLayout() on window.load */
    var heroHeight = 400;  /* fallback; real value set by cacheLayout() on window.load */
    var sectionTops    = [];
    var sectionBottoms = [];

    function cacheLayout() {
      navH       = navbar      ? navbar.offsetHeight      : 64;
      heroHeight = heroSection ? heroSection.offsetHeight : 400;
      sectionTops    = sections.map(function (s) { return s.offsetTop; });
      sectionBottoms = sections.map(function (s) { return s.offsetTop + s.offsetHeight; });
    }

    /* Build initial cache once layout is stable */
    if (document.readyState === 'complete') {
      cacheLayout();
    } else {
      window.addEventListener('load', cacheLayout, { once: true, passive: true });
    }

    var scrollResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(scrollResizeTimer);
      scrollResizeTimer = setTimeout(cacheLayout, 150);
    }, { passive: true });

    function onScroll() {
      var y         = window.scrollY;
      var scrollPos = y + navH + 80;  /* navH pre-cached — zero layout reads */

      /* 1. Navbar scrolled state */
      navbar.classList.toggle('scrolled', y > 80);

      /* 2. Active nav link highlight — all reads from cache, no reflow */
      for (var s = 0; s < sectionTops.length; s++) {
        var active = (scrollPos >= sectionTops[s] && scrollPos < sectionBottoms[s]);
        var id     = sections[s].id;
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
       BOROUGH FILTER — animated fade + scale
    ================================================ */
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        /* --------------------------------------------------
           Step 1 — instantly hide cards that don't match
           (no fade out, snap hidden) so the grid reflows
           immediately and matching cards move to the top
        -------------------------------------------------- */
        propCards.forEach(function (card) {
          var shouldHide = filter !== 'all' && card.dataset.borough !== filter;
          if (shouldHide) {
            card.classList.remove('card-showing', 'card-visible', 'card-hiding');
            card.classList.add('hidden-card');
          } else {
            card.classList.remove('hidden-card', 'card-hiding');
          }
        });

        /* --------------------------------------------------
           Step 2 — scroll to the first matching card
           (or section header for "All") now that the grid
           has reflowed and matching cards are at position 0
        -------------------------------------------------- */
        var scrollTarget;
        if (filter === 'all') {
          scrollTarget = document.getElementById('properties');
        } else {
          scrollTarget = propCards.find(function (c) {
            return c.dataset.borough === filter;
          }) || document.getElementById('properties');
        }
        if (scrollTarget) {
          var topOffset = scrollTarget.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 16;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }

        /* --------------------------------------------------
           Step 3 — fade visible cards in after a tiny delay
           so they animate in as the scroll arrives
        -------------------------------------------------- */
        propCards.forEach(function (card) {
          if (!card.classList.contains('hidden-card')) {
            setTimeout(function () {
              card.classList.add('card-showing');
              void card.offsetWidth;
              card.classList.add('card-visible');
              card.addEventListener('transitionend', function showDone() {
                card.removeEventListener('transitionend', showDone);
                card.classList.remove('card-showing', 'card-visible');
              });
            }, 120);
          }
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

    /* ── Submit — AJAX POST to handle-contact.php ───────── */
    var successTimer  = null;
    var submitBtn     = document.getElementById('submit-btn') ||
                        contactForm.querySelector('button[type="submit"]');
    var submitSpinner = document.getElementById('submit-spinner');
    var submitLabel   = document.getElementById('submit-label');
    var formErrorEl   = document.getElementById('form-server-error');

    function showFormError(msg) {
      if (!formErrorEl) return;
      formErrorEl.textContent = msg;
      formErrorEl.classList.remove('hidden');
      formErrorEl.classList.add('visible');
    }

    function hideFormError() {
      if (!formErrorEl) return;
      formErrorEl.textContent = '';
      formErrorEl.classList.add('hidden');
      formErrorEl.classList.remove('visible');
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var hasErrors = false;

      /* 1. Run existing client-side validation first */
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

      /* 2. Clear any previous server-side error */
      hideFormError();

      /* 3. Show loading state on the submit button */
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        if (submitSpinner) submitSpinner.classList.remove('hidden');
        if (submitLabel)   submitLabel.textContent = 'Sending\u2026';
      }

      /* 4. POST to PHP handler — FormData serialises all named
            inputs automatically, including the honeypot field  */
      fetch('handle-contact.php', {
        method:      'POST',
        body:        new FormData(contactForm),
        credentials: 'same-origin'
      })
        .then(function (res) {
          /* Safely parse JSON — server might return HTML on fatal error */
          return res.text().then(function (text) {
            var data;
            try { data = JSON.parse(text); } catch (e) { data = {}; }
            return { status: res.status, data: data };
          });
        })
        .then(function (result) {
          if (result.data.success === true) {
            /* 5a. Success — reset form and show the existing green banner */
            contactForm.reset();
            /* Re-fetch CSRF token for next submission */
            var csrfEl = document.getElementById('csrf_token');
            if (csrfEl) {
              fetch('csrf-token.php', { method: 'GET', credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (d) { if (d.token) csrfEl.value = d.token; })
                .catch(function () {});
            }
            formSuccess.classList.remove('hidden');
            formSuccess.classList.add('show');
            if (successTimer) clearTimeout(successTimer);
            successTimer = setTimeout(function () {
              formSuccess.classList.add('hidden');
              formSuccess.classList.remove('show');
            }, 6000);
          } else {
            /* 5b. PHP returned success: false — show the actual server error */
            var errMsg = result.data.error || '';
            /* 403 = CSRF/session issue — guide the user to reload */
            if (result.status === 403 || errMsg.toLowerCase().indexOf('invalid request') !== -1) {
              errMsg = 'Session expired \u2014 please reload the page and try again.';
            }
            /* 429 = rate limited */
            if (result.status === 429) {
              errMsg = errMsg || 'Too many requests \u2014 please wait a few minutes and try again.';
            }
            /* 500 = mail() failure on server */
            if (result.status === 500) {
              errMsg = 'Our server could not send your message right now. Please email us directly at info@brickstonerealtygroups.com';
            }
            showFormError(errMsg || 'Something went wrong. Please reload the page and try again.');
          }
        })
        .catch(function () {
          /* 5c. Network failure / PHP not running / file:// protocol */
          showFormError(
            'Could not reach the server \u2014 please make sure the site is live, or email us at info@brickstonerealtygroups.com'
          );
        })
        .finally(function () {
          /* Always restore the submit button — even on JSON parse failure */
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
            if (submitSpinner) submitSpinner.classList.add('hidden');
            if (submitLabel)   submitLabel.textContent = 'Send Message';
          }
        });
    });

    /* ================================================
       CSRF TOKEN — fetch once on load, inject into form
    ================================================ */
    var csrfInput = document.getElementById('csrf_token');
    if (csrfInput) {
      fetch('csrf-token.php', { method: 'GET', credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.token) csrfInput.value = d.token; })
        .catch(function () { /* non-fatal — PHP will reject with 403 */ });
    }


    /* ================================================
       RENT AFFORDABILITY CALCULATOR
       All wired here — no inline onclick/oninput in HTML.
       Rule: NYC landlords require 40× monthly rent.
    ================================================ */
    function calcFmt(n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    }

    function calcSwitch(mode) {
      var tabRent     = document.getElementById('calc-tab-rent');
      var tabIncome   = document.getElementById('calc-tab-income');
      var panelRent   = document.getElementById('calc-panel-rent');
      var panelIncome = document.getElementById('calc-panel-income');
      if (!tabRent) return;
      if (mode === 'rent') {
        tabRent.classList.add('active');      tabRent.setAttribute('aria-selected', 'true');
        tabIncome.classList.remove('active'); tabIncome.setAttribute('aria-selected', 'false');
        panelRent.classList.remove('hidden');
        panelIncome.classList.add('hidden');
      } else {
        tabIncome.classList.add('active');   tabIncome.setAttribute('aria-selected', 'true');
        tabRent.classList.remove('active');  tabRent.setAttribute('aria-selected', 'false');
        panelIncome.classList.remove('hidden');
        panelRent.classList.add('hidden');
      }
    }

    function calcFromRent() {
      var val    = parseFloat(document.getElementById('input-rent').value);
      var result = document.getElementById('result-rent');
      if (!val || val <= 0 || !isFinite(val) || val > 99999) {
        result.classList.add('hidden'); return;
      }
      document.getElementById('result-rent-annual').textContent  = calcFmt(val * 40);
      document.getElementById('result-rent-monthly').textContent = calcFmt((val * 40) / 12);
      /* Re-trigger CSS fade-in animation on each value change */
      result.classList.add('hidden');
      void result.offsetWidth;   /* force reflow */
      result.classList.remove('hidden');
    }

    function calcFromIncome() {
      var val    = parseFloat(document.getElementById('input-income').value);
      var result = document.getElementById('result-income');
      if (!val || val <= 0 || !isFinite(val) || val > 9999999) {
        result.classList.add('hidden'); return;
      }
      document.getElementById('result-income-rent').textContent   = calcFmt(val / 40);
      document.getElementById('result-income-annual').textContent = calcFmt((val / 40) * 12);
      /* Re-trigger CSS fade-in animation on each value change */
      result.classList.add('hidden');
      void result.offsetWidth;   /* force reflow */
      result.classList.remove('hidden');
    }

    /* Bind calculator tab buttons */
    var calcTabRent   = document.getElementById('calc-tab-rent');
    var calcTabIncome = document.getElementById('calc-tab-income');
    var calcInputRent = document.getElementById('input-rent');
    var calcInputIncome = document.getElementById('input-income');

    if (calcTabRent)    calcTabRent.addEventListener('click',  function () { calcSwitch('rent'); });
    if (calcTabIncome)  calcTabIncome.addEventListener('click', function () { calcSwitch('income'); });
    if (calcInputRent)  calcInputRent.addEventListener('input', calcFromRent);
    if (calcInputIncome) calcInputIncome.addEventListener('input', calcFromIncome);


    /* ================================================
       PROPERTY CARD CAROUSEL
       - Arrow click navigation
       - Dot indicator sync
       - Touch/swipe left-right
       - Keyboard arrow keys (when focused)
       - Video slide: play when visible, pause on leave
       - Lazy-loads off-screen carousels via IntersectionObserver
    ================================================ */

    var carousels = Array.prototype.slice.call(document.querySelectorAll('.card-carousel'));

    function initCarousel(carousel, preWidth) {
      var track    = carousel.querySelector('.card-slides');
      var slides   = Array.prototype.slice.call(carousel.querySelectorAll('.card-slide'));
      var dots     = Array.prototype.slice.call(carousel.querySelectorAll('.card-dot'));
      var prevBtn  = carousel.querySelector('.card-arrow-prev');
      var nextBtn  = carousel.querySelector('.card-arrow-next');
      var total    = slides.length;
      var current  = 0;
      var startX   = 0;
      var isDragging = false;

      if (!track || total === 0) return;

      /* Pixel-based sizing — avoids % resolving against inflated flex track */
      var cw = (preWidth > 0) ? preWidth : 0;

      function setSizes() {
        if (cw === 0) {
          var container = track.parentElement;
          cw = container ? container.offsetWidth : carousel.offsetWidth;
        }
        if (cw === 0) {
          requestAnimationFrame(setSizes); /* retry once layout is painted */
          return;
        }
        slides.forEach(function (s) {
          s.style.width    = cw + 'px';
          s.style.minWidth = cw + 'px';
        });
        track.style.width = (total * cw) + 'px';
      }

      /* Mark last state on init */
      if (total <= 1) {
        carousel.setAttribute('data-last', 'true');
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        return;
      }

      /* ---- Core go-to function ---- */
      function goTo(idx, skipVideo) {
        /* Clamp */
        idx = Math.max(0, Math.min(total - 1, idx));
        current = idx;

        /* Translate track */
        track.style.transform = 'translateX(-' + (idx * cw) + 'px)';

        /* Update data-index for CSS arrow hiding */
        carousel.setAttribute('data-index', idx);
        carousel.setAttribute('data-last', idx === total - 1 ? 'true' : 'false');

        /* Sync dots */
        dots.forEach(function (d, i) {
          d.classList.toggle('active', i === idx);
        });

        /* Handle video on this slide */
        if (!skipVideo) {
          var activeSlide = slides[idx];
          var video = activeSlide ? activeSlide.querySelector('.card-video') : null;
          if (video) {
            video.load();
            var p = video.play();
            if (p && typeof p.catch === 'function') {
              p.catch(function () {});
            }
          }
          /* Pause any video on non-active slides */
          slides.forEach(function (slide, i) {
            if (i !== idx) {
              var v = slide.querySelector('.card-video');
              if (v) { v.pause(); v.currentTime = 0; }
            }
          });
        }
      }

      /* ---- Arrow buttons ---- */
      if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          goTo(current - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          goTo(current + 1);
        });
      }

      /* ---- Touch / swipe ---- */
      carousel.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        isDragging = true;
      }, { passive: true });

      carousel.addEventListener('touchend', function (e) {
        if (!isDragging) return;
        isDragging = false;
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          goTo(diff > 0 ? current + 1 : current - 1);
        }
      }, { passive: true });

      /* ---- Keyboard (when carousel or its children are focused) ---- */
      carousel.setAttribute('tabindex', '0');
      carousel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          goTo(e.key === 'ArrowRight' ? current + 1 : current - 1);
        }
      });

      /* ---- Lazy-load: buffer first-slide video when card enters viewport ---- */
      var card = carousel.closest('.property-card');
      var firstVideo = slides[0] ? slides[0].querySelector('.card-video') : null;

      if (firstVideo && 'IntersectionObserver' in window) {
        var vidObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (firstVideo.dataset.poster) {
                firstVideo.setAttribute('poster', firstVideo.dataset.poster);
                delete firstVideo.dataset.poster;
              }
              firstVideo.load();
              vidObserver.unobserve(entry.target);
            }
          });
        }, { rootMargin: '200px 0px' });
        vidObserver.observe(card || carousel);
      }

      /* ---- Hover: play video if slide 0 is a video, pause on leave ---- */
      if (card) {
        card.addEventListener('mouseenter', function () {
          var video = slides[current] ? slides[current].querySelector('.card-video') : null;
          if (video) {
            var p = video.play();
            if (p && typeof p.catch === 'function') {
              p.catch(function () {});
            }
          }
        });
        card.addEventListener('mouseleave', function () {
          slides.forEach(function (slide) {
            var v = slide.querySelector('.card-video');
            if (v) { v.pause(); v.currentTime = 0; }
          });
        });
      }

      /* Init: size slides in px, then navigate to slide 0 */
      setSizes();
      goTo(0, true);
    }

    /* Carousel init strategy:
       - First 2: initialized immediately (above fold on mobile).
       - Remaining 46: deferred via IntersectionObserver — tasks only run
         when user scrolls near each section → ZERO TBT during page load.
       - rootMargin '200px 0px' starts init 200px before entering viewport. */
    var BATCH_IMMEDIATE = 2;

    for (var ci = 0; ci < Math.min(BATCH_IMMEDIATE, carousels.length); ci++) {
      var _t = carousels[ci].querySelector('.card-slides');
      var _c = _t ? _t.parentElement : null;
      var _w = _c ? (_c.offsetWidth || 0) : (carousels[ci].offsetWidth || 0);
      initCarousel(carousels[ci], _w);
    }

    if (carousels.length > BATCH_IMMEDIATE && 'IntersectionObserver' in window) {
      var carouselObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          initCarousel(entry.target, 0); /* 0 = read fresh offsetWidth on scroll (outside TBT window) */
          carouselObserver.unobserve(entry.target);
        });
      }, { rootMargin: '200px 0px' });
      for (var di = BATCH_IMMEDIATE; di < carousels.length; di++) {
        carouselObserver.observe(carousels[di]);
      }
    } else if (carousels.length > BATCH_IMMEDIATE) {
      /* Fallback for browsers without IntersectionObserver */
      for (var fi = BATCH_IMMEDIATE; fi < carousels.length; fi++) {
        initCarousel(carousels[fi], 0);
      }
    }

    /* ---- Resize / orientation: recalculate all carousel sizes ---- */
    var carouselResizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(carouselResizeTimer);
      carouselResizeTimer = setTimeout(function () {
        carousels.forEach(function (carousel) {
          var track   = carousel.querySelector('.card-slides');
          var slides  = Array.prototype.slice.call(carousel.querySelectorAll('.card-slide'));
          var total   = slides.length;
          var current = parseInt(carousel.getAttribute('data-index') || '0', 10);
          if (!track || total === 0) return;

          var container = track.parentElement;
          var cw = container ? container.offsetWidth : carousel.offsetWidth;
          if (cw === 0) {
            /* Orientation change may briefly report 0 — retry next frame */
            requestAnimationFrame(function () {
              var cw2 = container ? container.offsetWidth : carousel.offsetWidth;
              if (cw2 === 0) return;
              slides.forEach(function (s) {
                s.style.width    = cw2 + 'px';
                s.style.minWidth = cw2 + 'px';
              });
              track.style.width     = (total * cw2) + 'px';
              track.style.transform = 'translateX(-' + (current * cw2) + 'px)';
            });
            return;
          }

          slides.forEach(function (s) {
            s.style.width    = cw + 'px';
            s.style.minWidth = cw + 'px';
          });
          track.style.width     = (total * cw) + 'px';
          track.style.transform = 'translateX(-' + (current * cw) + 'px)';
        });
      }, 150); /* 150ms debounce — smooth on orientation change */
    });


    /* ================================================
       FULLSCREEN PHOTO LIGHTBOX
       Opens on card slide click — StreetEasy-style
       Arrow nav · dots · counter · keyboard · swipe
    ================================================ */
    var lbEl       = document.getElementById('lb');
    var lbStage    = document.getElementById('lb-stage');
    var lbTitleEl  = document.getElementById('lb-title');
    var lbLabelEl  = document.getElementById('lb-label');
    var lbCounterEl = document.getElementById('lb-counter');
    var lbDotsEl   = document.getElementById('lb-dots');
    var lbPrevBtn  = document.getElementById('lb-prev');
    var lbNextBtn  = document.getElementById('lb-next');
    var lbCloseBtn = document.getElementById('lb-close');

    if (lbEl && lbStage && lbPrevBtn && lbNextBtn && lbCloseBtn) {

      var lbData   = [];   /* [{type, src, poster, label, alt}] */
      var lbIdx    = 0;
      var lbTotal  = 0;
      var lbSX     = 0;   /* touch start X */
      var lbOpener = null; /* element to restore focus to on close */

      function lbSyncDots() {
        var dots = lbDotsEl.querySelectorAll('.lb-dot');
        dots.forEach(function (d, i) { d.classList.toggle('active', i === lbIdx); });
      }

      function lbGoTo(idx) {
        idx = Math.max(0, Math.min(lbTotal - 1, idx));
        lbIdx = idx;
        var slide = lbData[idx];

        /* Render media */
        lbStage.innerHTML = '';
        if (slide.type === 'video') {
          var vid = document.createElement('video');
          vid.controls = true;
          vid.loop = true;
          vid.setAttribute('playsinline', '');
          if (slide.poster) vid.setAttribute('poster', slide.poster);
          var vsrc = document.createElement('source');
          vsrc.src = slide.src;
          vsrc.type = 'video/mp4';
          vid.appendChild(vsrc);
          lbStage.appendChild(vid);
          vid.load();
          var vp = vid.play();
          if (vp && vp.catch) vp.catch(function () {});
        } else {
          var img = document.createElement('img');
          img.src = slide.src;
          img.alt = slide.alt || '';
          lbStage.appendChild(img);
        }

        /* Update footer */
        if (lbLabelEl)  lbLabelEl.textContent  = slide.label || '';
        if (lbCounterEl) lbCounterEl.textContent = (idx + 1) + ' / ' + lbTotal;
        lbSyncDots();

        /* Arrow states */
        lbPrevBtn.disabled = (idx === 0);
        lbNextBtn.disabled = (idx === lbTotal - 1);
      }

      function openLb(slides, startIdx, title) {
        lbData  = slides;
        lbTotal = slides.length;
        if (lbTitleEl) lbTitleEl.textContent = title || '';

        /* Build dots */
        lbDotsEl.innerHTML = '';
        for (var di = 0; di < lbTotal; di++) {
          var dot = document.createElement('span');
          dot.className = 'lb-dot';
          dot.setAttribute('aria-label', 'Go to photo ' + (di + 1));
          (function (n) {
            dot.addEventListener('click', function () { lbGoTo(n); });
          }(di));
          lbDotsEl.appendChild(dot);
        }

        /* Show overlay */
        lbEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lbGoTo(startIdx || 0);
        requestAnimationFrame(function () { lbEl.classList.add('lb-open'); });
        lbCloseBtn.focus();
      }

      function closeLb() {
        lbEl.classList.remove('lb-open');
        lbEl.setAttribute('aria-hidden', 'true');
        /* After fade-out finishes: stop media + restore scroll + refocus */
        setTimeout(function () {
          lbStage.innerHTML = '';
          document.body.style.overflow = '';
          if (lbOpener && lbOpener.focus) { lbOpener.focus(); }
        }, 260);
      }

      /* Arrow buttons */
      lbPrevBtn.addEventListener('click', function () { lbGoTo(lbIdx - 1); });
      lbNextBtn.addEventListener('click', function () { lbGoTo(lbIdx + 1); });

      /* Close button */
      lbCloseBtn.addEventListener('click', closeLb);

      /* Click on overlay backdrop (not inner content) to close */
      lbEl.addEventListener('click', function (e) {
        if (e.target === lbEl) { closeLb(); }
      });

      /* Keyboard: Escape + Arrow keys */
      document.addEventListener('keydown', function (e) {
        if (lbEl.getAttribute('aria-hidden') === 'true') return;
        if (e.key === 'Escape')     { e.preventDefault(); closeLb(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); lbGoTo(lbIdx + 1); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); lbGoTo(lbIdx - 1); }
      });

      /* Touch swipe */
      lbEl.addEventListener('touchstart', function (e) {
        lbSX = e.touches[0].clientX;
      }, { passive: true });
      lbEl.addEventListener('touchend', function (e) {
        var diff = lbSX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { lbGoTo(diff > 0 ? lbIdx + 1 : lbIdx - 1); }
      }, { passive: true });

      /* ---- Wire click handlers onto every card slide ---- */
      carousels.forEach(function (carousel) {
        var cSlides  = Array.prototype.slice.call(carousel.querySelectorAll('.card-slide'));
        var propCard = carousel.closest('.property-card');
        var h3El     = propCard ? propCard.querySelector('h3') : null;
        var propName = h3El ? h3El.textContent.trim() : '';

        /* Build slide-data array for this carousel */
        var slideData = cSlides.map(function (sl) {
          var slImg  = sl.querySelector('img');
          var slVid  = sl.querySelector('video');
          var slLbl  = sl.querySelector('.card-slide-label');
          var lText  = slLbl ? slLbl.textContent.trim() : '';
          if (slVid) {
            var vSrc = slVid.querySelector('source');
            return {
              type: 'video',
              src: vSrc ? vSrc.src : '',
              poster: slVid.getAttribute('poster') || '',
              label: lText,
              alt: ''
            };
          }
          /* Use data-src if image hasn't loaded yet (deferred lazy load) */
          var rawSrc = slImg ? (slImg.getAttribute('data-src') || slImg.src) : '';
          var hqSrc  = rawSrc.replace(/([?&]w=)\d+/, function (m, p) {
            return p + '1600';
          });
          return {
            type: 'img',
            src: hqSrc || rawSrc,
            alt: slImg ? (slImg.alt || '') : '',
            label: lText
          };
        });

        /* Add click + keyboard-enter handler to each slide */
        cSlides.forEach(function (sl, idx) {
          sl.setAttribute('role', 'button');
          sl.setAttribute('tabindex', '0');
          sl.setAttribute('aria-label', 'View full photo');
          sl.addEventListener('click', function () {
            lbOpener = sl;
            openLb(slideData, idx, propName);
          });
          sl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              lbOpener = sl;
              openLb(slideData, idx, propName);
            }
          });
        });
      });

    } /* end if (lbEl) */


  } /* end init() */

}());
