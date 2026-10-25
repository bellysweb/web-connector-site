(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menu && nav) menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  const params = new URLSearchParams(location.search);
  const demo = params.get('demo') === '1' || location.protocol === 'file:';
  if (demo) document.body.classList.add('demo-mode');
  const setStatus = (form, message, error = false) => {
    const status = form.querySelector('.form-status');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('error', error);
  };
  const payloadFrom = form => Object.fromEntries(new FormData(form).entries());

  const leadForm = document.querySelector('#lead-form');
  if (leadForm) {
    const service = params.get('service');
    const serviceSelect = leadForm.elements.service;
    if (service && serviceSelect) {
      const normalized = service.toLowerCase();
      const alias = normalized.includes('website') ? 'website design' : normalized.includes('automation') ? 'business automation' : normalized.includes('voice') ? 'ai voice agents' : normalized.includes('reception') ? 'ai receptionist' : normalized.includes('workflow') ? 'ai workflows' : normalized.includes('process') ? 'process improvement' : normalized;
      const option = [...serviceSelect.options].find(item => item.text.toLowerCase() === alias || item.text.toLowerCase() === normalized);
      if (option) serviceSelect.value = option.value;
    }
    leadForm.addEventListener('submit', async event => {
      event.preventDefault();
      const button = leadForm.querySelector('button[type="submit"]');
      button.disabled = true;
      setStatus(leadForm, 'Sending your enquiry…');
      if (demo) {
        const entries = JSON.parse(localStorage.getItem('wc_demo_leads') || '[]');
        entries.push({ ...payloadFrom(leadForm), receivedAt: new Date().toISOString(), status: 'demo only' });
        localStorage.setItem('wc_demo_leads', JSON.stringify(entries));
        setStatus(leadForm, 'Demo enquiry saved in this browser only. Connect the Cloudflare function and n8n webhook for live delivery.');
        leadForm.reset(); button.disabled = false; return;
      }
      try {
        const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadFrom(leadForm)) });
        const responseText = await response.text();
        let result = {};
        try { result = responseText ? JSON.parse(responseText) : {}; }
        catch { throw new Error(`The form endpoint returned HTTP ${response.status}. The Cloudflare form handler may not be deployed.`); }
        if (!response.ok) throw new Error(result.error || `The form endpoint returned HTTP ${response.status}.`);
        setStatus(leadForm, 'Thanks — your enquiry has been sent. We’ll be in touch.');
        leadForm.reset();
      } catch (error) {
        const message = error instanceof TypeError
          ? 'Could not reach /api/lead. Confirm the Cloudflare Pages Function is deployed; static files alone cannot process the form.'
          : error.message || 'We could not send that just now. Please email hello@web-connector.win.';
        setStatus(leadForm, message, true);
      }
      button.disabled = false;
    });
  }

})();
