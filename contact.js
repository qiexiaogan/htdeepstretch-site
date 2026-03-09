(function () {
  'use strict';

  var FORM_ACTION = 'https://formspree.io/f/xblkqbrp';

  var modalHTML =
    '<div id="contactModal" class="modal-overlay">' +
      '<div class="modal">' +
        '<button id="closeModal" class="modal-close" aria-label="Close">&times;</button>' +
        '<h2>Get in Touch</h2>' +
        '<form id="contactForm" action="' + FORM_ACTION + '" method="POST">' +
          '<label for="c-name">Name</label>' +
          '<input id="c-name" name="name" type="text" required />' +
          '<label for="c-email">Email</label>' +
          '<input id="c-email" name="email" type="email" required />' +
          '<label for="c-phone">Phone</label>' +
          '<input id="c-phone" name="phone" type="tel" />' +
          '<label for="c-message">Message</label>' +
          '<textarea id="c-message" name="message" rows="4" required></textarea>' +
          '<button type="submit" id="contactSubmit">Send</button>' +
        '</form>' +
        '<p id="contactSuccess" hidden>Thank you! We\'ll be in touch soon.</p>' +
        '<p id="contactError" hidden>Sorry, something went wrong. Please try again.</p>' +
      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  var modal = document.getElementById('contactModal');
  var closeBtn = document.getElementById('closeModal');
  var contactTriggers = document.querySelectorAll('.contact-trigger');

  if (!modal || !closeBtn) return;

  function openModal(e) {
    e.preventDefault();
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  contactTriggers.forEach(function (el) { el.addEventListener('click', openModal); });
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  var form = document.getElementById('contactForm');
  var submitBtn = document.getElementById('contactSubmit');
  var successMsg = document.getElementById('contactSuccess');
  var errorMsg = document.getElementById('contactError');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successMsg.hidden = true;
    errorMsg.hidden = true;

    if (!form.reportValidity()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending\u2026';

    var data = {};
    new FormData(form).forEach(function (val, key) { data[key] = val; });

    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (res) {
      if (res.ok) {
        successMsg.hidden = false;
        form.reset();
        setTimeout(closeModal, 2000);
      } else {
        return res.json().catch(function () { return {}; }).then(function (info) {
          errorMsg.textContent = (info.errors && info.errors[0] && info.errors[0].message) ||
            'Sorry, something went wrong. Please try again.';
          errorMsg.hidden = false;
        });
      }
    })
    .catch(function () {
      errorMsg.hidden = false;
    })
    .then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    });
  });
})();
