/* ==========================================================================
   MAIN.JS - Lógica Compartida en Todas las Páginas
   1. Control del menú desplegable en móviles con iconos <i>
   2. Resaltado automático del enlace activo y transición suave entre páginas
   3. Año actual dinámico en el pie de página
   4. Brillo especular interactivo Liquid Glass y helper global de Toast
   5. Animación Scroll Reveal escalonada con IntersectionObserver
   6. Visor Lightbox mejorado (flechas internas, contador, teclado y swipe)
   7. Panel desplegable "Consultar detalles" en projects.html
   8. Carrusel interactivo con soporte táctil (Swipe) y teclado
   9. Robot de cuerpo completo con física Lerp (requestAnimationFrame) y scroll
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------------
  // 1. MENÚ RESPONSIVO (Móviles) USANDO ELEMENTO <i class="icon ..."></i>
  // ------------------------------------------------------------------------
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.innerHTML = isOpen
        ? '<i class="icon icon-close" aria-hidden="true"></i>'
        : '<i class="icon icon-menu" aria-hidden="true"></i>';
    });
  }

  // ------------------------------------------------------------------------
  // 2. RESALTADO AUTOMÁTICO Y TRANSICIÓN SUAVE ENTRE PÁGINAS
  // ------------------------------------------------------------------------
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Limpia la clase si el usuario vuelve con el botón "Atrás" del navegador
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-leaving');
  });

  if (!prefersReducedMotion) {
    document.querySelectorAll('a[href]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        const target = anchor.getAttribute('target');
        const isDownload = anchor.hasAttribute('download');

        if (
          !href ||
          target === '_blank' ||
          isDownload ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('http') ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }

        // Evita recargar si ya está en la misma ruta exacta
        if (href === currentPath) return;

        e.preventDefault();
        document.body.classList.add('page-leaving');
        setTimeout(() => {
          window.location.href = href;
        }, 155);
      });
    });
  }

  // ------------------------------------------------------------------------
  // 3. FUNCIÓN PARA ACTUALIZAR EL AÑO AUTOMÁTICAMENTE EN EL FOOTER
  // ------------------------------------------------------------------------
  function updateFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  updateFooterYear();

  // ------------------------------------------------------------------------
  // 4. REFLEJO ESPECULAR LIQUID GLASS + NOTIFICACIÓN TOAST GLOBAL
  // ------------------------------------------------------------------------
  const glassCards = document.querySelectorAll(
    '.bento-card, .highlight-card, .about-card, .credential-card, .skill-category, .project-card, .channel-card, .contact-form-card'
  );

  glassCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  let toastTimer = null;
  window.showGlassToast = function showGlassToast(message) {
    let toast = document.getElementById('glass-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'glass-toast';
      toast.className = 'glass-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = '<i class="icon icon-check" aria-hidden="true"></i><span></span>';
      document.body.appendChild(toast);
    }

    const textSpan = toast.querySelector('span');
    if (textSpan) textSpan.textContent = message;

    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  };

  // ------------------------------------------------------------------------
  // 5. ANIMACIÓN SCROLL REVEAL ESCALONADA (IntersectionObserver)
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll(
    '.section-header, .bento-card, .highlight-card, .credential-card, .about-card, .skill-category, .project-card, .channel-card, .contact-form-card, .tech-item-card'
  );

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('reveal-visible'));
  } else {
    revealElements.forEach((el, index) => {
      el.classList.add('reveal-item');
      const delay = (index % 6) * 55;
      el.style.transitionDelay = `${delay}ms`;
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // ------------------------------------------------------------------------
  // 6 & 8. CARRUSEL INTERACTIVO + VISOR LIGHTBOX SINCRONIZADOS
  // Soporta flechas dentro del Lightbox, teclado (←/→/Esc) y swipe táctil
  // ------------------------------------------------------------------------
  const carouselFrame = document.getElementById('venpox-carousel');
  let carouselApi = null;

  if (carouselFrame) {
    const slides = carouselFrame.querySelectorAll('.carousel-slide');
    const prevBtn = carouselFrame.querySelector('.carousel-btn.prev');
    const nextBtn = carouselFrame.querySelector('.carousel-btn.next');
    const dotsContainer = document.getElementById('carousel-dots');
    const captionBox = document.getElementById('carousel-caption');
    const windowTitle = document.getElementById('carousel-window-title');
    const counterBadge = document.getElementById('carousel-counter');
    const carouselBox = carouselFrame.querySelector('.project-carousel');
    let currentSlide = 0;

    if (dotsContainer && slides.length > 1) {
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = index === 0 ? 'carousel-dot active' : 'carousel-dot';
        dot.setAttribute('aria-label', `Ver captura ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');

      const activeImg = slides[currentSlide].querySelector('img');
      if (activeImg) {
        const title = activeImg.getAttribute('alt') || 'Vista del proyecto';
        const desc = activeImg.getAttribute('data-description') || '';

        if (captionBox) {
          captionBox.innerHTML = `<strong>${title}:</strong> ${desc}`;
        }
        if (windowTitle) {
          windowTitle.textContent = `venpox.vercel.app · ${title}`;
        }
      }

      if (counterBadge) {
        counterBadge.textContent = `${currentSlide + 1} / ${slides.length}`;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    }

    // Deslizamiento táctil (Swipe) en el carrusel para celulares
    if (carouselBox && slides.length > 1) {
      let touchStartX = 0;
      let touchStartY = 0;

      carouselBox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      }, { passive: true });

      carouselBox.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) goToSlide(currentSlide + 1);
          else goToSlide(currentSlide - 1);
        }
      }, { passive: true });
    }

    carouselApi = {
      goToSlide,
      getCurrentIndex: () => currentSlide
    };
  }

  // Visor Lightbox mejorado (flechas internas, contador y swipe)
  const projectImages = Array.from(document.querySelectorAll('.project-img'));

  if (projectImages.length > 0) {
    let lightboxIndex = 0;
    const hasMultiple = projectImages.length > 1;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.innerHTML = `
      <div class="lightbox-content" id="lightbox-content">
        <div class="lightbox-header">
          <div class="lightbox-meta">
            <span class="lightbox-counter" id="lightbox-counter">1 / ${projectImages.length}</span>
            <span class="lightbox-caption" id="lightbox-caption">Vista previa del proyecto</span>
          </div>
          <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Cerrar vista ampliada">
            <i class="icon icon-close" aria-hidden="true"></i>
          </button>
        </div>
        <div class="lightbox-stage">
          <button type="button" class="lightbox-nav prev" id="lightbox-prev" aria-label="Captura anterior" ${hasMultiple ? '' : 'hidden'}>
            <i class="icon icon-chevron-left" aria-hidden="true"></i>
          </button>
          <img src="" alt="" class="lightbox-img" id="lightbox-img">
          <button type="button" class="lightbox-nav next" id="lightbox-next" aria-label="Siguiente captura" ${hasMultiple ? '' : 'hidden'}>
            <i class="icon icon-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
        <p class="lightbox-desc" id="lightbox-desc"></p>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    function renderLightboxImage(index) {
      lightboxIndex = (index + projectImages.length) % projectImages.length;
      const img = projectImages[lightboxIndex];

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.alt || 'Vista previa del proyecto';

      if (lightboxCounter) {
        lightboxCounter.textContent = `${lightboxIndex + 1} / ${projectImages.length}`;
        lightboxCounter.style.display = hasMultiple ? 'inline-block' : 'none';
      }

      const extraDesc = img.getAttribute('data-description');
      if (lightboxDesc) {
        lightboxDesc.textContent = extraDesc || '';
        lightboxDesc.style.display = extraDesc ? 'block' : 'none';
      }

      // Sincroniza el carrusel de fondo con la captura actual del Lightbox
      if (carouselApi) {
        carouselApi.goToSlide(lightboxIndex);
      }
    }

    projectImages.forEach((img, index) => {
      img.setAttribute('title', 'Haz clic para ampliar la imagen');
      img.addEventListener('click', () => {
        renderLightboxImage(index);
        lightbox.classList.add('open');
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('open');
    };

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', () => renderLightboxImage(lightboxIndex - 1));
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', () => renderLightboxImage(lightboxIndex + 1));
    }

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Swipe táctil dentro del modal Lightbox
    if (lightboxContent && hasMultiple) {
      let lbTouchX = 0;
      let lbTouchY = 0;

      lightboxContent.addEventListener('touchstart', (e) => {
        lbTouchX = e.changedTouches[0].clientX;
        lbTouchY = e.changedTouches[0].clientY;
      }, { passive: true });

      lightboxContent.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].clientX - lbTouchX;
        const diffY = e.changedTouches[0].clientY - lbTouchY;

        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) renderLightboxImage(lightboxIndex + 1);
          else renderLightboxImage(lightboxIndex - 1);
        }
      }, { passive: true });
    }

    // Navegación por teclado (Esc, Flecha Izquierda y Flecha Derecha)
    document.addEventListener('keydown', (e) => {
      const isLightboxOpen = lightbox.classList.contains('open');
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
        return;
      }

      if (isTyping || !hasMultiple) return;

      if (e.key === 'ArrowRight') {
        if (isLightboxOpen) renderLightboxImage(lightboxIndex + 1);
        else if (carouselApi) carouselApi.goToSlide(carouselApi.getCurrentIndex() + 1);
      } else if (e.key === 'ArrowLeft') {
        if (isLightboxOpen) renderLightboxImage(lightboxIndex - 1);
        else if (carouselApi) carouselApi.goToSlide(carouselApi.getCurrentIndex() - 1);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 7. BOTÓN "CONSULTAR DETALLES" DESPLEGABLE EN PROJECTS.HTML
  // ------------------------------------------------------------------------
  const toggleDetailsBtn = document.getElementById('toggle-project-details');
  const detailsDrawer = document.getElementById('project-details-drawer');

  if (toggleDetailsBtn && detailsDrawer) {
    toggleDetailsBtn.addEventListener('click', () => {
      const isOpen = detailsDrawer.classList.toggle('open');
      toggleDetailsBtn.setAttribute('aria-expanded', isOpen);
      toggleDetailsBtn.textContent = isOpen ? 'Ocultar detalles' : 'Consultar detalles';
    });
  }

  // ------------------------------------------------------------------------
  // 9. ROBOT DE CUERPO COMPLETO CON FÍSICA FLUIDA (Lerp + requestAnimationFrame)
  // Sigue la mirada y reacciona al scroll con inercia orgánica
  // ------------------------------------------------------------------------
  const robotStage = document.createElement('div');
  robotStage.className = 'interactive-robot-stage';
  robotStage.setAttribute('aria-hidden', 'true');
  robotStage.innerHTML = `
    <svg class="robot-full-svg" id="robot-full-svg" viewBox="0 0 120 155" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roboArmor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="roboDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>

      <!-- CAPA 1: TORSO, CUELLO Y PROPULSOR INFERIOR -->
      <g class="robot-torso-group" id="robot-torso-group">
        <ellipse cx="60" cy="134" rx="14" ry="4.5" fill="#047857" opacity="0.45"/>
        <path d="M 48 124 Q 60 138 72 124 Z" fill="url(#roboDark)"/>
        <rect x="53" y="68" width="14" height="10" rx="4" fill="#334155"/>
        <path d="M 34 80 C 34 74, 86 74, 86 80 L 80 120 C 78 128, 42 128, 40 120 Z" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="2"/>
        <rect x="44" y="85" width="32" height="22" rx="8" fill="#e2e8f0" stroke="#ffffff" stroke-width="1"/>
        <circle cx="60" cy="96" r="7" fill="url(#roboDark)"/>
        <circle class="robot-core-light" cx="60" cy="96" r="4.2" fill="#10b981"/>
        <circle cx="58.8" cy="94.8" r="1.3" fill="#ffffff" opacity="0.9"/>
        <line x1="49" y1="114" x2="71" y2="114" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
      </g>

      <!-- CAPA 2: BRAZOS / MANOS MAGNÉTICAS FLOTANTES -->
      <g class="robot-arms-group" id="robot-arms-group">
        <g id="robot-arm-left">
          <rect x="15" y="82" width="13" height="32" rx="6.5" transform="rotate(8 21 98)" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="21" cy="87" r="2.5" fill="#047857"/>
        </g>
        <g id="robot-arm-right">
          <rect x="92" y="82" width="13" height="32" rx="6.5" transform="rotate(-8 98 98)" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="99" cy="87" r="2.5" fill="#047857"/>
        </g>
      </g>

      <!-- CAPA 3: CABEZA COMPLETA -->
      <g class="robot-head-group" id="robot-head-group">
        <g class="robot-antenna-group" id="robot-antenna-group">
          <line x1="60" y1="10" x2="60" y2="22" stroke="#475569" stroke-width="3.2" stroke-linecap="round"/>
          <circle class="robot-antenna-light" cx="60" cy="9" r="4.5" fill="#10b981"/>
        </g>

        <rect x="19" y="38" width="7" height="18" rx="3.5" fill="#047857"/>
        <rect x="94" y="38" width="7" height="18" rx="3.5" fill="#047857"/>
        <rect x="24" y="20" width="72" height="52" rx="24" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="2.2"/>
        <path d="M 38 25 Q 60 21 82 25" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.95"/>

        <g class="robot-visor-group" id="robot-visor-group">
          <rect x="31" y="30" width="58" height="32" rx="14" fill="url(#roboDark)" stroke="#334155" stroke-width="1.2"/>
          <path d="M 37 35 Q 50 32 62 35" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round"/>
        </g>

        <g class="robot-eyes-group" id="robot-eyes-group">
          <rect class="robot-eye" x="42" y="40" width="9" height="12" rx="4.5" fill="#10b981"/>
          <rect class="robot-eye" x="69" y="40" width="9" height="12" rx="4.5" fill="#10b981"/>
          <circle cx="45" cy="43" r="1.6" fill="#ffffff" opacity="0.95"/>
          <circle cx="72" cy="43" r="1.6" fill="#ffffff" opacity="0.95"/>
        </g>
      </g>
    </svg>
    <div class="robot-ground-shadow"></div>
  `;
  document.body.appendChild(robotStage);

  const roboHead = document.getElementById('robot-head-group');
  const roboVisor = document.getElementById('robot-visor-group');
  const roboEyes = document.getElementById('robot-eyes-group');
  const roboAntenna = document.getElementById('robot-antenna-group');
  const roboTorso = document.getElementById('robot-torso-group');
  const roboArms = document.getElementById('robot-arms-group');

  if (!prefersReducedMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScrollImpulse = 0;
    let currentScrollImpulse = 0;
    let lastScrollY = window.scrollY;

    document.addEventListener('mousemove', (e) => {
      const rect = robotStage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.35;

      targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.6)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight * 0.6)));
    });

    // Reacción suave al hacer scroll (los brazos y la antena sienten la inercia)
    window.addEventListener('scroll', () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      targetScrollImpulse = Math.max(-1, Math.min(1, delta / 35));
    }, { passive: true });

    // Bucle de animación con interpolación lineal (Lerp)
    function animateRobot() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      currentScrollImpulse += (targetScrollImpulse - currentScrollImpulse) * 0.14;
      targetScrollImpulse *= 0.88; // El impulso de scroll se disipa suavemente

      const combinedY = Math.max(-1, Math.min(1, currentY + currentScrollImpulse * 0.45));

      roboEyes.style.transform = `translate(${currentX * 8.5}px, ${combinedY * 6}px)`;
      roboVisor.style.transform = `translate(${currentX * 3.8}px, ${combinedY * 2.8}px)`;
      roboHead.style.transform = `translate(${currentX * 3.5}px, ${combinedY * 2.5}px) rotate(${currentX * 7}deg)`;
      roboAntenna.style.transform = `translate(${currentX * -2.5}px, ${currentScrollImpulse * -3.5}px) rotate(${currentX * -10}deg)`;
      roboTorso.style.transform = `translate(${currentX * 1.6}px, ${combinedY * 1.2}px) rotate(${currentX * 2.5}deg)`;
      roboArms.style.transform = `translate(${currentX * -2.8}px, ${currentY * -1.8 + currentScrollImpulse * -5}px)`;

      requestAnimationFrame(animateRobot);
    }

    requestAnimationFrame(animateRobot);

    // Parpadeo natural automático
    setInterval(() => {
      robotStage.classList.add('robot-blinking');
      setTimeout(() => robotStage.classList.remove('robot-blinking'), 140);
    }, 3600);
  }

  // Destello de energía en el núcleo y ojos al pasar sobre botones o enlaces
  const interactiveEls = document.querySelectorAll('a, button, .project-img, .tech-item-card');
  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => robotStage.classList.add('robot-Alert'));
    el.addEventListener('mouseleave', () => robotStage.classList.remove('robot-Alert'));
  });
});
