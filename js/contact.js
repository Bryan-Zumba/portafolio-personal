/* ==========================================================================
   CONTACT.JS - Lógica exclusiva de la página de Contacto (contact.html)
   1. Copiar dirección de correo al portapapeles con un clic
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
  // 1. BOTÓN PARA COPIAR CORREO AL PORTAPAPELES
  // ------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailTextElement = document.getElementById('email-text');

  if (copyEmailBtn && emailTextElement) {
    copyEmailBtn.addEventListener('click', () => {
      const emailToCopy = emailTextElement.textContent.trim();

      navigator.clipboard.writeText(emailToCopy).then(() => {
        const originalText = copyEmailBtn.textContent;
        copyEmailBtn.textContent = '¡Correo copiado!';
        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
        }, 2000);
      });
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
