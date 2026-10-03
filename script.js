const body = document.body;
const toast = document.getElementById('toast');
const preloader = document.getElementById('preloader');
const preloaderMeter = document.getElementById('preloaderMeter');
const preloaderCount = document.getElementById('preloaderCount');
const preloaderStatus = document.getElementById('preloaderStatus');
const scrollProgress = document.getElementById('scrollProgress');
const siteHeader = document.querySelector('.site-header');

// A short, branded boot sequence gives the event site a proper opening beat.
let loadProgress = 0;
const bootMessages = ['Tuning the signal', 'Loading the rooms', 'Finding the frequency', 'Ready when you are'];
const bootTimer = window.setInterval(() => {
  loadProgress += Math.random() * 15 + 7;
  if (loadProgress >= 100) {
    loadProgress = 100;
    window.clearInterval(bootTimer);
    preloaderStatus.textContent = bootMessages[3];
    window.setTimeout(() => {
      preloader.classList.add('is-done');
      body.classList.add('is-loaded');
    }, 360);
  } else {
    preloaderStatus.textContent = bootMessages[Math.min(2, Math.floor(loadProgress / 35))];
  }
  preloaderMeter.style.width = `${loadProgress}%`;
  preloaderCount.textContent = String(Math.round(loadProgress)).padStart(2, '0');
}, 125);

// Scroll-linked UI: the header tucks away into a glassy utility bar and the
// acid progress line makes the long-form page feel like one continuous piece.
let scrollTicking = false;
function updateScrollUI() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 42);
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

// Reveal sections as they enter the viewport.
const observer = new IntersectionObserver((entries, observerInstance) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observerInstance.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

// Mobile navigation.
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Filter the lineup by program type.
const filterButtons = document.querySelectorAll('.filter-btn');
const artistCards = document.querySelectorAll('.artist-card');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    artistCards.forEach((card) => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.type !== filter);
    });
  });
});

// Toggle the two-day schedule.
const dayTabs = document.querySelectorAll('.day-tab');
const scheduleBoards = document.querySelectorAll('.schedule-board');
dayTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    dayTabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    scheduleBoards.forEach((board) => board.classList.toggle('is-hidden', board.dataset.schedule !== tab.dataset.day));
  });
});

// Ticket feedback interaction.
document.querySelectorAll('.ticket-button').forEach((button) => {
  button.addEventListener('click', () => showToast(`${button.dataset.ticket} selected — checkout opens soon.`));
});
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

// Desktop-only cursor and tilt effects.
if (window.matchMedia('(pointer: fine)').matches) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let x = -100, y = -100, ringX = -100, ringY = -100;
  body.classList.add('cursor-ready');
  window.addEventListener('mousemove', (event) => { x = event.clientX; y = event.clientY; });
  const render = () => {
    dot.style.left = `${x}px`; dot.style.top = `${y}px`;
    ringX += (x - ringX) * .16; ringY += (y - ringY) * .16;
    ring.style.left = `${ringX}px`; ring.style.top = `${ringY}px`;
    requestAnimationFrame(render);
  };
  render();

  // Small magnetic pull on the main actions — just enough to reward attention.
  document.querySelectorAll('.button-acid, .nav-ticket, .plain-link').forEach((element) => {
    element.addEventListener('mousemove', (event) => {
      const rect = element.getBoundingClientRect();
      const moveX = (event.clientX - rect.left - rect.width / 2) * .13;
      const moveY = (event.clientY - rect.top - rect.height / 2) * .13;
      element.style.translate = `${moveX}px ${moveY}px`;
    });
    element.addEventListener('mouseleave', () => { element.style.translate = ''; });
  });

  // Let the hero artwork respond to the user's hand without hijacking scroll.
  const heroArt = document.querySelector('.hero-art');
  const artLayers = heroArt ? heroArt.querySelectorAll('.art-orb, .art-caption, .art-word, .art-coordinates, .art-theme-badge, .art-mark') : [];
  if (heroArt) {
    heroArt.addEventListener('mousemove', (event) => {
      const rect = heroArt.getBoundingClientRect();
      const pointerX = event.clientX - rect.left - rect.width / 2;
      const pointerY = event.clientY - rect.top - rect.height / 2;
      artLayers.forEach((layer, index) => {
        const depth = (index + 1) * .018;
        layer.style.translate = `${pointerX * depth}px ${pointerY * depth}px`;
      });
    });
    heroArt.addEventListener('mouseleave', () => artLayers.forEach((layer) => { layer.style.translate = ''; }));
  }

  document.querySelectorAll('a, button, .artist-visual, .venue-block').forEach((element) => {
    element.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
    element.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
  });
  document.querySelectorAll('.artist-visual, .venue-art').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const xTilt = ((event.clientX - rect.left) / rect.width - .5) * 2.2;
      const yTilt = ((event.clientY - rect.top) / rect.height - .5) * -2.2;
      card.style.transform = `perspective(900px) rotateX(${yTilt}deg) rotateY(${xTilt}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
