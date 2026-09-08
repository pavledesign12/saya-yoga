// ==========================================================================
// SAYA — interakcije
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Nav: glass efekat + prebacivanje boja preko svetlih/tamnih sekcija ---------- */
  const nav = document.getElementById('siteNav');
  const darkSections = document.querySelectorAll('.hero, .testimonial, .cta, .booking');
  let navTicking = false;

  const updateNavAppearance = () => {
    navTicking = false;
    const navHeight = nav.offsetHeight;

    // Da li se trenutno neka tamna sekcija (hero ili CTA) nalazi iza navigacije?
    let overDark = false;
    darkSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navHeight && rect.bottom >= 0) {
        overDark = true;
      }
    });

    nav.classList.toggle('nav--on-dark', overDark);
    nav.classList.toggle('nav--on-light', !overDark);
    nav.classList.toggle('nav--scrolled', window.scrollY > 8);
    if (typeof updateActiveLink === 'function') updateActiveLink();
  };

  const requestNavUpdate = () => {
    if (!navTicking) {
      navTicking = true;
      requestAnimationFrame(updateNavAppearance);
    }
  };

  /* ---------- Aktivni link u navigaciji (scroll-spy) ---------- */
  const navSpyLinks = Array.from(
    document.querySelectorAll('.nav__links a[href^="#"], .nav__mobile a[href^="#"]')
  ).filter((link) => link.getAttribute('href').length > 1 && !link.classList.contains('btn'));

  const spyTargets = navSpyLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((entry) => entry.section);

  function updateActiveLink() {
    const line = window.scrollY + nav.offsetHeight + 80;
    let current = null;
    spyTargets.forEach((entry) => {
      const top = entry.section.getBoundingClientRect().top + window.scrollY;
      if (top <= line) current = entry.link.getAttribute('href');
    });
    navSpyLinks.forEach((link) => {
      link.classList.toggle('is-active', current !== null && link.getAttribute('href') === current);
    });
  }

  updateActiveLink();
  updateNavAppearance();
  window.addEventListener('scroll', requestNavUpdate, { passive: true });
  window.addEventListener('resize', requestNavUpdate);

  /* ---------- Mobilni meni ---------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');

  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('is-menu-open', isOpen);
  });

  const mobileClose = document.getElementById('navMobileClose');
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-menu-open');
    });
  }

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-menu-open');
    });
  });

  /* ---------- FAQ akordeon ---------- */
  const accordionItems = document.querySelectorAll('.accordion__item');

  const setPanelHeight = (panel, open) => {
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = '0px';
    }
  };

  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');

    // Inicijalno stanje
    const startsOpen = item.classList.contains('accordion__item--open');
    setPanelHeight(panel, startsOpen);

    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('accordion__item--open');

      // Zatvori sve ostale (samo jedan otvoren odjednom)
      accordionItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('accordion__item--open');
          other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
          setPanelHeight(other.querySelector('.accordion__panel'), false);
        }
      });

      item.classList.toggle('accordion__item--open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
      setPanelHeight(panel, willOpen);
    });
  });

  // Ponovo izračunaj visinu otvorenog panela pri promeni veličine prozora
  window.addEventListener('resize', () => {
    document.querySelectorAll('.accordion__item--open .accordion__panel').forEach((panel) => {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* ---------- Suptilan reveal (Zenna-style, ulaz elemenata u viewport) ---------- */
  const revealGroups = [
    '.section-head > *',
    '.benefits__item',
    '.classes__head .btn',
    '.class-card',
    '.instructor__image',
    '.instructor__content > *',
    '.price-card',
    '.pricing__note > *',
    '.accordion__item',
    '.cta__content > *',
    '.booking__head > *',
    '.booking__form .field, .booking__submit',
    '.booking__map',
  ];
  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (i) el.style.transitionDelay = Math.min(i * 0.09, 0.36) + 's';
    });
  });
  document.querySelectorAll('.class-card__bg, .instructor__image img, .cta__bg img')
    .forEach((img) => img.classList.add('reveal-img'));

  const revealItems = document.querySelectorAll('.reveal, .reveal-img');
  if ('IntersectionObserver' in window && revealItems.length) {
    document.documentElement.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Rezervacija: forma + popup ---------- */
  const bookingForm = document.getElementById('bookingForm');
  const bookingModal = document.getElementById('bookingModal');
  const bookingStatus = document.getElementById('bookingStatus');

  const openModal = () => {
    if (!bookingModal) return;
    bookingModal.hidden = false;
    document.body.style.overflow = 'hidden';
    const btn = bookingModal.querySelector('.modal__btn');
    if (btn) btn.focus();
  };
  const closeModal = () => {
    if (!bookingModal) return;
    bookingModal.hidden = true;
    document.body.style.overflow = '';
  };

  if (bookingModal) {
    bookingModal.querySelectorAll('[data-modal-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !bookingModal.hidden) closeModal();
    });
  }

  if (bookingForm) {
    // "Termin" polje: placeholder DD/MM/GGGG, a na fokus postaje pravi date picker
    const dateField = bookingForm.querySelector('[data-dateish]');
    if (dateField) {
      const toDate = () => { dateField.type = 'date'; };
      const toText = () => { if (!dateField.value) dateField.type = 'text'; };
      dateField.addEventListener('focus', toDate);
      dateField.addEventListener('click', toDate);
      dateField.addEventListener('blur', toText);
      const today = new Date().toISOString().slice(0, 10);
      dateField.min = today;
    }

    const typeSelect = bookingForm.querySelector('#bfType');
    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        typeSelect.classList.toggle('is-empty', !typeSelect.value);
      });
    }

    bookingForm.querySelectorAll('input, select, textarea').forEach((el) => {
      el.addEventListener('input', () => el.classList.remove('has-error'));
      el.addEventListener('change', () => el.classList.remove('has-error'));
    });

    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submit = bookingForm.querySelector('.booking__submit');
      const required = Array.from(bookingForm.querySelectorAll('[required]'));
      let firstInvalid = null;

      required.forEach((el) => {
        const ok = el.value.trim() !== '' && el.checkValidity();
        el.classList.toggle('has-error', !ok);
        if (!ok && !firstInvalid) firstInvalid = el;
      });

      bookingStatus.classList.remove('booking__status--error');

      if (firstInvalid) {
        bookingStatus.textContent = 'Popuni obavezna polja (označena zvezdicom).';
        bookingStatus.classList.add('booking__status--error');
        firstInvalid.focus();
        return;
      }

      const data = {
        _subject: 'Nova rezervacija probnog časa — SAYA',
        _template: 'table',
        'Ime i prezime': bookingForm.bfName.value.trim(),
        'Email adresa': bookingForm.bfEmail.value.trim(),
        'Vrsta časa': bookingForm.bfType.value,
        'Termin': bookingForm.bfDate.value,
        'Dodatne napomene': bookingForm.bfNote.value.trim() || '—'
      };

      submit.disabled = true;
      bookingStatus.textContent = 'Šaljem rezervaciju…';

      try {
        const res = await fetch('https://formsubmit.co/ajax/pavledesign.contact@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Greška pri slanju');
        bookingForm.reset();
        if (typeSelect) typeSelect.classList.add('is-empty');
        const df = bookingForm.querySelector('[data-dateish]');
        if (df) df.type = 'text';
        bookingStatus.textContent = '';
        openModal();
      } catch (err) {
        bookingStatus.textContent = 'Slanje nije uspelo. Piši nam direktno na pavledesign.contact@gmail.com.';
        bookingStatus.classList.add('booking__status--error');
      } finally {
        submit.disabled = false;
      }
    });
  }

  /* ---------- Glatko skrolovanje za linkove sa # ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(requestNavUpdate, 700);
        }
      }
    });
  });

});


/* Hero text masked reveal — runs once on load */
(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var wraps = hero.querySelectorAll('.hero-reveal');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hero.classList.add('is-revealed'); });
  });
  wraps.forEach(function (w) {
    var el = w.firstElementChild;
    if (!el) return;
    el.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') {
        w.classList.add('is-done');
        el.style.willChange = 'auto';
      }
    }, { once: true });
  });
})();


/* Hero brojke — reveal jednom, kada uđu u viewport */
(function () {
  var stats = document.querySelector('.hero__stats');
  if (!stats) return;
  var show = function () {
    stats.classList.add('is-in');
    stats.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') stats.classList.add('is-done');
    }, { once: true });
  };
  /* Brojke čekaju prvi scroll — i na mobilnom i na desktopu */
  var onScroll = function () {
    if (window.scrollY > 16) {
      window.removeEventListener('scroll', onScroll);
      show();
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* Nav fade-in kada hero fotka bude spremna */
(function () {
  var nav = document.querySelector('.nav');
  var img = document.querySelector('.hero__bg-img');
  if (!nav) return;
  var show = function () {
    requestAnimationFrame(function () { nav.classList.add('is-nav-in'); });
  };
  if (!img || img.complete) { show(); return; }
  img.addEventListener('load', show, { once: true });
  img.addEventListener('error', show, { once: true });
  setTimeout(show, 2500); // fallback
})();


/* Fiksna hero fotka se sakrije kada se hero prođe (da ne curi ispod footera) */
(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var update = function () {
    var past = hero.getBoundingClientRect().bottom <= 0;
    document.body.classList.toggle('is-past-hero', past);
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
