import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-600.css';
import '@fontsource/oswald/latin-700.css';
import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── WhatsApp links ───────────────────────────────────────────────────────────
const WHATSAPP_URL =
  'https://api.whatsapp.com/send?phone=5548991885129&text=Ol%C3%A1%21+Gostaria+de+conhecer+melhor+a+Academia+Styllus.+Quero+saber+sobre+os+planos%2C+hor%C3%A1rios+e+a+estrutura.';

document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  link.href = WHATSAPP_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});

// ─── Menu ─────────────────────────────────────────────────────────────────────
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...nav.querySelectorAll('a')];

function closeMenu({ restoreFocus = false } = {}) {
  nav.classList.remove('is-open');
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuToggle.focus();
}

function trapMenuFocus(event) {
  if (event.key !== 'Tab' || !nav.classList.contains('is-open')) return;
  const focusable = [menuToggle, ...navLinks];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  if (isOpen) { closeMenu(); return; }
  nav.classList.add('is-open');
  menuToggle.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Fechar menu');
  document.body.classList.add('menu-open');
  window.setTimeout(() => navLinks[0].focus(), 240);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu({ restoreFocus: true });
  trapMenuFocus(event);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 960 && nav.classList.contains('is-open')) closeMenu();
});

// ─── WhatsApp floating button ─────────────────────────────────────────────────
const whatsappFloat = document.querySelector('.whatsapp-float');
const heroCta = document.querySelector('[data-hero-cta]');
const floatGuards = [...document.querySelectorAll('[data-float-guard]')];
let heroCtaVisible = true;
const visibleGuards = new Set();

function updateFloatingWhatsapp() {
  whatsappFloat.classList.toggle('is-visible', !heroCtaVisible && visibleGuards.size === 0);
}

if ('IntersectionObserver' in window) {
  const heroCtaObserver = new IntersectionObserver(([entry]) => {
    heroCtaVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
    updateFloatingWhatsapp();
  }, { threshold: 0.15 });

  const guardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleGuards.add(entry.target);
      else visibleGuards.delete(entry.target);
    });
    updateFloatingWhatsapp();
  }, { threshold: 0.2 });

  heroCtaObserver.observe(heroCta);
  floatGuards.forEach((guard) => guardObserver.observe(guard));
} else {
  whatsappFloat.classList.add('is-visible');
}

// ─── Sticky header ────────────────────────────────────────────────────────────
const header = document.querySelector('[data-header]');
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// ─── Hero entry animations (GSAP) ────────────────────────────────────────────
if (!prefersReduced) {
  const heroEntries = [
    { selector: '.hero-lockup',       delay: 0.08 },
    { selector: '.hero-values-panel', delay: 0.52 },
    { selector: 'h1',                 delay: 0.36 },
    { selector: '.hero-lead',         delay: 0.60 },
    { selector: '.hero-support',      delay: 0.76 },
    { selector: '.hero-actions',      delay: 0.92 },
  ];

  heroEntries.forEach(({ selector, delay }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    gsap.from(el, {
      opacity: 0,
      y: 22,
      duration: 1.1,
      delay,
      ease: 'power3.out',
      clearProps: 'all',
    });
  });
}

// ─── Scroll reveal (GSAP ScrollTrigger) ──────────────────────────────────────
document.querySelectorAll('.reveal').forEach((el) => {
  const rawDelay = el.style.getPropertyValue('--reveal-delay');
  const revealDelay = rawDelay ? parseFloat(rawDelay) / 1000 : 0;

  if (prefersReduced) return; // elements already visible by default in CSS

  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 92%',
      toggleActions: 'play none none none',
      once: true,
    },
    opacity: 0,
    y: 22,
    duration: 0.85,
    delay: revealDelay,
    ease: 'power2.out',
    clearProps: 'all',
  });
});
