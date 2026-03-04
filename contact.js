(function () {
  // Modal functionality
  const modal = document.getElementById('contactModal');
  const contactBtn = document.getElementById('contactBtn');
  const closeBtn = document.getElementById('closeModal');

  // Open modal
  contactBtn.addEventListener('click', () => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Form handling
  const form = document.getElementById('contactForm');
  const btn  = document.getElementById('contactSubmit');
  const ok   = document.getElementById('contactSuccess');
  const err  = document.getElementById('contactError');

  // Optional: auto-save drafts so users don't lose text
  const fields = ['name','email','phone','message'];
  const key = 'contactDraft';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    fields.forEach(f => {
      const el = form.querySelector(`[name="${f}"]`);
      if (el && saved[f]) el.value = saved[f];
      if (el) {
        el.addEventListener('input', () => {
          const cur = JSON.parse(localStorage.getItem(key) || '{}');
          cur[f] = el.value;
          localStorage.setItem(key, JSON.stringify(cur));
        });
      }
    });
  } catch (_) {}

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ok.hidden = true;
    err.hidden = true;

    if (!form.reportValidity()) return;

    btn.disabled = true;
    btn.textContent = 'Sending…';

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        ok.hidden = false;
        form.reset();
        localStorage.removeItem('contactDraft');
        
        // Close modal after successful submission (optional)
        setTimeout(() => {
          modal.classList.remove('show');
          document.body.style.overflow = '';
        }, 2000);
      } else {
        const info = await res.json().catch(() => ({}));
        err.textContent = info?.errors?.[0]?.message || 'Sorry, something went wrong. Please try again.';
        err.hidden = false;
      }
    } catch (e2) {
      err.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send';
    }
  });
})();
