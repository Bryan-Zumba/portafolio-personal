/* ==========================================================================
   MAIN.JS - Lógica Compartida en Todas las Páginas
   1. Control del menú desplegable en móviles con iconos <i>
   2. Resaltado automático del enlace activo en la barra de navegación
   3. Año actual dinámico en el pie de página
   4. Brillo especular interactivo Liquid Glass al mover el cursor
   5. Animación Scroll Reveal escalonada con IntersectionObserver
   6. Visor Lightbox en Cristal Líquido para ampliar capturas de proyectos
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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
  // 2. RESALTADO AUTOMÁTICO DE LA PÁGINA ACTIVA EN EL MENÚ
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

  // ------------------------------------------------------------------------
  // 3. FUNCIÓN PARA ACTUALIZAR EL AÑO AUTOMÁTICAMENTE EN EL FOOTER
  // ------------------------------------------------------------------------
  function updateFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
      const currentYear = new Date().getFullYear();
      yearSpan.textContent = currentYear;
    }
  }

  updateFooterYear();

  // ------------------------------------------------------------------------
  // 4. REFLEJO ESPECULAR INTERACTIVO LIQUID GLASS
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

  // ------------------------------------------------------------------------
  // 5. ANIMACIÓN SCROLL REVEAL ESCALONADA (IntersectionObserver)
  // Hace que los módulos y tarjetas aparezcan suavemente al entrar en pantalla
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll(
    '.section-header, .bento-card, .highlight-card, .credential-card, .about-card, .skill-category, .project-card, .channel-card, .contact-form-card, .tech-item-card'
  );

  revealElements.forEach((el, index) => {
    el.classList.add('reveal-item');
    // Retraso escalonado suave para elementos cercanos
    const delay = (index % 6) * 55;
    el.style.transitionDelay = `${delay}ms`;
  });

  if ('IntersectionObserver' in window) {
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
  } else {
    revealElements.forEach((el) => el.classList.add('reveal-visible'));
  }

  // ------------------------------------------------------------------------
  // 6. VISOR LIGHTBOX PARA AMPLIAR CAPTURAS DE PROYECTOS (ej. VENPOX.png)
  // Al hacer clic en cualquier imagen con clase .project-img, abre un modal
  // ------------------------------------------------------------------------
  const projectImages = document.querySelectorAll('.project-img');

  if (projectImages.length > 0) {
    // Crear el contenedor del modal dinámicamente con JS puro
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <div class="lightbox-header">
          <span class="lightbox-caption" id="lightbox-caption">Vista previa del proyecto</span>
          <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Cerrar vista ampliada">
            <i class="icon icon-close" aria-hidden="true"></i>
          </button>
        </div>
        <img src="" alt="" class="lightbox-img" id="lightbox-img">
        <p class="lightbox-desc" id="lightbox-desc"></p>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');

    // Función para abrir el modal con la imagen seleccionada y su descripción
    projectImages.forEach((img) => {
      img.setAttribute('title', 'Haz clic para ampliar la imagen');
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt || 'Vista previa del proyecto';
        const extraDesc = img.getAttribute('data-description');
        if (lightboxDesc) {
          lightboxDesc.textContent = extraDesc || '';
          lightboxDesc.style.display = extraDesc ? 'block' : 'none';
        }
        lightbox.classList.add('open');
      });
    });

    // Función para cerrar el modal
    const closeLightbox = () => {
      lightbox.classList.remove('open');
    };

    lightboxClose.addEventListener('click', closeLightbox);

    // Cerrar al hacer clic fuera de la tarjeta (en el fondo oscuro desenfocado)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Cerrar con la tecla Escape del teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
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
  // 8. CARRUSEL INTERACTIVO DE IMÁGENES DEL PROYECTO (projects.html)
  // Actualiza imagen activa, puntos indicadores, contador y descripción
  // ------------------------------------------------------------------------
  const carouselFrame = document.getElementById('venpox-carousel');

  if (carouselFrame) {
    const slides = carouselFrame.querySelectorAll('.carousel-slide');
    const prevBtn = carouselFrame.querySelector('.carousel-btn.prev');
    const nextBtn = carouselFrame.querySelector('.carousel-btn.next');
    const dotsContainer = document.getElementById('carousel-dots');
    const captionBox = document.getElementById('carousel-caption');
    const windowTitle = document.getElementById('carousel-window-title');
    const counterBadge = document.getElementById('carousel-counter');
    let currentSlide = 0;

    // Generar dinámicamente un punto indicador por cada imagen en el HTML
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

      // Ciclo infinito hacia adelante o hacia atrás
      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');

      // Actualizar texto descriptivo y barra de ventana con los atributos de la imagen activa
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
  }

  // ------------------------------------------------------------------------
  // 9. ROBOT DE CUERPO COMPLETO (Cabeza, Torso, Brazos flotantes y Mirada 3D)
  // Levita libremente sin burbujas de chat y sigue el cursor con todo el cuerpo
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
        <!-- Anillo propulsor inferior -->
        <ellipse cx="60" cy="134" rx="14" ry="4.5" fill="#047857" opacity="0.45"/>
        <path d="M 48 124 Q 60 138 72 124 Z" fill="url(#roboDark)"/>

        <!-- Articulación del cuello -->
        <rect x="53" y="68" width="14" height="10" rx="4" fill="#334155"/>

        <!-- Cuerpo / Torso curvo estilo droide moderno -->
        <path d="M 34 80 C 34 74, 86 74, 86 80 L 80 120 C 78 128, 42 128, 40 120 Z" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="2"/>

        <!-- Panel pectoral y reactor Esmeralda en el pecho -->
        <rect x="44" y="85" width="32" height="22" rx="8" fill="#e2e8f0" stroke="#ffffff" stroke-width="1"/>
        <circle cx="60" cy="96" r="7" fill="url(#roboDark)"/>
        <circle class="robot-core-light" cx="60" cy="96" r="4.2" fill="#10b981"/>
        <circle cx="58.8" cy="94.8" r="1.3" fill="#ffffff" opacity="0.9"/>

        <!-- Líneas de detalle mecánico en abdomen -->
        <line x1="49" y1="114" x2="71" y2="114" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
      </g>

      <!-- CAPA 2: BRAZOS / MANOS MAGNÉTICAS FLOTANTES -->
      <g class="robot-arms-group" id="robot-arms-group">
        <!-- Brazo izquierdo -->
        <g id="robot-arm-left">
          <rect x="15" y="82" width="13" height="32" rx="6.5" transform="rotate(8 21 98)" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="21" cy="87" r="2.5" fill="#047857"/>
        </g>
        <!-- Brazo derecho -->
        <g id="robot-arm-right">
          <rect x="92" y="82" width="13" height="32" rx="6.5" transform="rotate(-8 98 98)" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="99" cy="87" r="2.5" fill="#047857"/>
        </g>
      </g>

      <!-- CAPA 3: CABEZA COMPLETA (Se inclina y mira hacia el mouse) -->
      <g class="robot-head-group" id="robot-head-group">
        <!-- Antena superior -->
        <g class="robot-antenna-group" id="robot-antenna-group">
          <line x1="60" y1="10" x2="60" y2="22" stroke="#475569" stroke-width="3.2" stroke-linecap="round"/>
          <circle class="robot-antenna-light" cx="60" cy="9" r="4.5" fill="#10b981"/>
        </g>

        <!-- Orejas / Sensores laterales -->
        <rect x="19" y="38" width="7" height="18" rx="3.5" fill="#047857"/>
        <rect x="94" y="38" width="7" height="18" rx="3.5" fill="#047857"/>

        <!-- Casco principal -->
        <rect x="24" y="20" width="72" height="52" rx="24" fill="url(#roboArmor)" stroke="#ffffff" stroke-width="2.2"/>
        <!-- Reflejo superior del casco -->
        <path d="M 38 25 Q 60 21 82 25" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.95"/>

        <!-- Visor oscuro -->
        <g class="robot-visor-group" id="robot-visor-group">
          <rect x="31" y="30" width="58" height="32" rx="14" fill="url(#roboDark)" stroke="#334155" stroke-width="1.2"/>
          <path d="M 37 35 Q 50 32 62 35" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Ojos LED Esmeralda que siguen al puntero -->
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

  // Seguimiento de mirada y cuerpo en tiempo real al mover el mouse
  document.addEventListener('mousemove', (e) => {
    const rect = robotStage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.35;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.6)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight * 0.6)));

    // Ojos y visor se enfocan directamente en la dirección del mouse
    roboEyes.style.transform = `translate(${normX * 8.5}px, ${normY * 6}px)`;
    roboVisor.style.transform = `translate(${normX * 3.8}px, ${normY * 2.8}px)`;

    // La cabeza gira e inclina hacia el puntero
    roboHead.style.transform = `translate(${normX * 3.5}px, ${normY * 2.5}px) rotate(${normX * 7}deg)`;

    // La antena hace contrapeso elástico
    roboAntenna.style.transform = `translate(${normX * -2.5}px, 0px) rotate(${normX * -10}deg)`;

    // El torso y los brazos flotantes acompañan el movimiento con parallax suave
    roboTorso.style.transform = `translate(${normX * 1.6}px, ${normY * 1.2}px) rotate(${normX * 2.5}deg)`;
    roboArms.style.transform = `translate(${normX * -2.8}px, ${normY * -1.8}px)`;
  });

  // Parpadeo natural automático
  setInterval(() => {
    robotStage.classList.add('robot-blinking');
    setTimeout(() => robotStage.classList.remove('robot-blinking'), 140);
  }, 3600);

  // Destello de energía en el núcleo y ojos al pasar sobre botones o enlaces
  const interactiveEls = document.querySelectorAll('a, button, .project-img, .tech-item-card');
  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => robotStage.classList.add('robot-Alert'));
    el.addEventListener('mouseleave', () => robotStage.classList.remove('robot-Alert'));
  });
});
