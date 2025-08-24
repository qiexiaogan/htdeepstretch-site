(function () {
  // Modal functionality
  const modal = document.getElementById('applicationModal');
  const applyBtn = document.getElementById('applyBtn');
  const closeBtn = document.getElementById('closeApplicationModal');

  // Open modal
  applyBtn.addEventListener('click', () => {
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
  const form = document.getElementById('applicationForm');
  const btn = document.getElementById('applicationSubmit');
  const ok = document.getElementById('applicationSuccess');
  const err = document.getElementById('applicationError');

  // Optional: auto-save drafts so users don't lose text
  const fields = ['name', 'email', 'phone', 'jobRole', 'message'];
  const key = 'applicationDraft';
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
    btn.textContent = 'Submitting…';

    const formData = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        ok.hidden = false;
        form.reset();
        localStorage.removeItem('applicationDraft');
        
        // Close modal after successful submission
        setTimeout(() => {
          modal.classList.remove('show');
          document.body.style.overflow = '';
        }, 3000);
      } else {
        const info = await res.json().catch(() => ({}));
        err.textContent = info?.errors?.[0]?.message || 'Sorry, something went wrong. Please try again.';
        err.hidden = false;
      }
    } catch (e2) {
      err.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Application';
    }
  });
})();
