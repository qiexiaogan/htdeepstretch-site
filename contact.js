(function () {
  const form = document.getElementById('contactForm');
  const btn  = document.getElementById('contactSubmit');
  const ok   = document.getElementById('contactSuccess');
  const err  = document.getElementById('contactError');

  // Optional: auto-save drafts so users don't lose text
  const fields = ['name','email','message'];
  const key = 'contactDraft';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    fields.forEach(f => {
      const el = form.querySelector(`[name="${f}"]`);
      if (saved[f]) el.value = saved[f];
      el.addEventListener('input', () => {
        const cur = JSON.parse(localStorage.getItem(key) || '{}');
        cur[f] = el.value;
        localStorage.setItem(key, JSON.stringify(cur));
      });
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
