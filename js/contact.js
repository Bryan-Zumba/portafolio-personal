/* ==========================================================================
   CONTACT.JS - Lógica exclusiva de la página de Contacto (contact.html)
   1. Copiar dirección de correo y teléfono al portapapeles con Toast flotante
   2. Validar los campos del formulario
   3. Enviar el mensaje armado directamente por WhatsApp o Correo (sin backend)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración real de contacto de Bryan Roberto Zumba Molleturo
  const CONTACT_CONFIG = {
    whatsappNumber: '593986520267', // Código de Ecuador (+593) + 986520267
    emailAddress: 'zumbabryan69@gmail.com'
  };

  // ------------------------------------------------------------------------
  // 1. COPIAR CORREO Y TELÉFONO AL PORTAPAPELES (+ FALLBACK PARA FILE://)
  // ------------------------------------------------------------------------
  function copyTextToClipboard(text, buttonEl, successBtnLabel, toastMessage) {
    const onSuccess = () => {
      if (buttonEl) {
        const originalText = buttonEl.dataset.originalText || buttonEl.textContent;
        buttonEl.dataset.originalText = originalText;
        buttonEl.textContent = successBtnLabel;

        clearTimeout(buttonEl._copyTimer);
        buttonEl._copyTimer = setTimeout(() => {
          buttonEl.textContent = originalText;
        }, 2000);
      }

      if (typeof window.showGlassToast === 'function') {
        window.showGlassToast(toastMessage);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
        fallbackCopy(text, onSuccess);
      });
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, callback) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      callback();
    } catch (_) {
      // Si el navegador bloquea la copia automática, no rompe la ejecución
    }
    document.body.removeChild(tempInput);
  }

  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailTextElement = document.getElementById('email-text');

  if (copyEmailBtn && emailTextElement) {
    copyEmailBtn.addEventListener('click', () => {
      const emailToCopy = emailTextElement.textContent.trim();
      copyTextToClipboard(emailToCopy, copyEmailBtn, '¡Copiado!', 'Correo copiado al portapapeles');
    });
  }

  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      const phoneToCopy = copyPhoneBtn.getAttribute('data-copy') || '0986520267';
      copyTextToClipboard(phoneToCopy, copyPhoneBtn, '¡Copiado!', 'Número copiado al portapapeles');
    });
  }

  // ------------------------------------------------------------------------
  // 2. VALIDACIÓN Y ENVÍO DEL FORMULARIO (Vía WhatsApp o Correo)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
  const feedbackBox = document.getElementById('form-feedback');

  // Función auxiliar para mostrar mensajes de estado (éxito o error)
  function showFeedback(message, type) {
    if (!feedbackBox) return;
    feedbackBox.textContent = message;
    feedbackBox.className = `form-feedback ${type}`;
  }

  // Función que lee y valida los campos del formulario
  function getValidatedFormData() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
      showFeedback('Por favor, completa todos los campos antes de continuar.', 'error');
      return null;
    }

    // Validación básica de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFeedback('Por favor, ingresa un correo electrónico válido.', 'error');
      return null;
    }

    return { name, email, subject, message };
  }

  // Opción A: Enviar formulario por Correo (evento submit principal)
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Evita que la página se recargue

      const data = getValidatedFormData();
      if (!data) return;

      const mailSubject = encodeURIComponent(`[Portafolio Web] ${data.subject}`);
      const mailBody = encodeURIComponent(
        `Hola Bryan, mi nombre es ${data.name} (${data.email}).\n\n${data.message}`
      );

      showFeedback(
        '¡Datos validados! Abriendo tu aplicación de correo para enviar el mensaje...',
        'success'
      );

      // Abre el cliente de correo con los datos listos
      window.location.href = `mailto:${CONTACT_CONFIG.emailAddress}?subject=${mailSubject}&body=${mailBody}`;
      contactForm.reset();
    });
  }

  // Opción B: Enviar los datos del formulario directo a WhatsApp
  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', () => {
      const data = getValidatedFormData();
      if (!data) return;

      const whatsappText = encodeURIComponent(
        `Hola Bryan, soy *${data.name}* (${data.email}).\n*Asunto:* ${data.subject}\n\n${data.message}`
      );

      showFeedback('¡Mensaje listo! Abriendo WhatsApp en una nueva pestaña...', 'success');

      const whatsappUrl = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${whatsappText}`;
      window.open(whatsappUrl, '_blank');
    });
  }
});
