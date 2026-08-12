import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-600.css';
import '@fontsource/oswald/latin-700.css';
import './styles.css';
import { getCampaignState } from './campaign.js';

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotionQuery.matches) {
  window.requestAnimationFrame(() => document.body.classList.add('is-motion-ready'));
}

const WHATSAPP_URL =
  'https://api.whatsapp.com/send?phone=5548991885129&text=Ol%C3%A1%21+Gostaria+de+conhecer+melhor+a+Academia+Styllus.+Quero+saber+sobre+os+planos%2C+hor%C3%A1rios+e+a+reinaugura%C3%A7%C3%A3o.';

document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  link.href = WHATSAPP_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});

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
  if (isOpen) {
    closeMenu();
    return;
  }

  nav.classList.add('is-open');
  menuToggle.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Fechar menu');
  document.body.classList.add('menu-open');
  window.setTimeout(() => navLinks[0].focus(), 240);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    closeMenu({ restoreFocus: true });
  }
  trapMenuFocus(event);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 960 && nav.classList.contains('is-open')) closeMenu();
});

function applyCampaignState() {
  if (getCampaignState() !== 'launched') return;

  const campaign = document.querySelector('[data-campaign]');
  campaign.classList.add('is-launched');
  document.querySelector('[data-campaign-kicker]').textContent = 'A nova fase começou';
  document.querySelector('[data-campaign-title]').innerHTML = 'A STYLLUS<br><em>ESTÁ DE VOLTA.</em>';
  document.querySelector('[data-campaign-promo]').textContent = 'Uma nova história já está em movimento.';
  document.querySelector('[data-campaign-date-wrap]').hidden = true;
  document.querySelector('[data-campaign-callout]').innerHTML = 'Venha conhecer a nova<br><strong>fase da Styllus!</strong>';
  document.querySelector('[data-campaign-copy]').textContent = 'Força, saúde, disciplina e resultados para ir ainda mais longe.';
  document.querySelector('[data-campaign-cta]').childNodes[0].textContent = 'Quero conhecer a Styllus ';
  document.querySelector('[data-campaign-note]').textContent = 'Fale com nossa equipe e conheça a academia.';
  document.querySelector('[data-campaign-nav]').textContent = 'Nova fase';
  document.querySelector('[data-campaign-secondary]').textContent = 'Conhecer a nova fase';
}

applyCampaignState();

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

const header = document.querySelector('[data-header]');
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const valueRotator = document.querySelector('[data-value-rotator]');

if (valueRotator) {
  const slides = [...valueRotator.querySelectorAll('[data-value-slide]')];
  const AUTOPLAY_DELAY = 5000;
  let activeIndex = 0;
  let autoplayTimer;

  function showValue(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotionQuery.matches || document.hidden) return;
    autoplayTimer = window.setInterval(() => {
      showValue(activeIndex + 1);
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });
  window.addEventListener('pageshow', startAutoplay);
  window.addEventListener('pagehide', stopAutoplay);
  reducedMotionQuery.addEventListener?.('change', () => {
    if (reducedMotionQuery.matches) showValue(0);
    startAutoplay();
  });

  showValue(0);
  startAutoplay();
}

const revealElements = [...document.querySelectorAll('.reveal')];
let revealFrame = 0;

const clamp = (value, minimum = 0, maximum = 1) => (
  Math.min(maximum, Math.max(minimum, value))
);

function updateRevealProgress() {
  revealFrame = 0;

  if (reducedMotionQuery.matches) {
    document.body.classList.remove('is-scroll-motion-ready');
    revealElements.forEach((element) => {
      element.style.opacity = '1';
      element.style.filter = 'none';
      element.style.webkitFilter = 'none';
      element.style.transform = 'none';
      element.style.webkitTransform = 'none';
      element.classList.add('is-visible');
    });
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const revealStart = viewportHeight * 0.95;
  const revealEnd = viewportHeight * 0.72;
  const revealRange = revealStart - revealEnd;

  revealElements.forEach((element) => {
    const delay = Number.parseInt(element.style.getPropertyValue('--reveal-delay'), 10) || 0;
    const stagger = clamp(delay / 700, 0, 0.25);
    const baseProgress = clamp((revealStart - element.getBoundingClientRect().top) / revealRange);
    const rawProgress = clamp((baseProgress - stagger) / (1 - stagger));
    const progress = rawProgress * rawProgress * (3 - (2 * rawProgress));
    const opacity = clamp(progress * 1.05);
    const offset = (1 - progress) * 20;
    const blur = (1 - progress) * 2.8;

    element.style.setProperty('--reveal-progress', opacity.toFixed(4));
    element.style.setProperty('--reveal-offset', `${offset.toFixed(2)}px`);
    element.style.setProperty('--reveal-blur', `${blur.toFixed(2)}px`);
    element.style.opacity = opacity.toFixed(4);
    element.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    element.style.webkitTransform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    element.style.filter = `blur(${blur.toFixed(2)}px)`;
    element.style.webkitFilter = `blur(${blur.toFixed(2)}px)`;

    element.classList.toggle('is-visible', progress >= 0.999);
  });

  document.body.classList.add('is-scroll-motion-ready');
}

function requestRevealUpdate() {
  if (revealFrame) return;
  revealFrame = window.requestAnimationFrame(updateRevealProgress);
}

updateRevealProgress();
window.addEventListener('scroll', requestRevealUpdate, { passive: true });
window.addEventListener('resize', requestRevealUpdate);
window.addEventListener('orientationchange', requestRevealUpdate);
window.addEventListener('pageshow', requestRevealUpdate);
reducedMotionQuery.addEventListener?.('change', requestRevealUpdate);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        requestRevealUpdate();
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach((el) => revealObserver.observe(el));
}
