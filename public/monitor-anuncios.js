(function () {
  if (!window.googletag || !googletag.pubads) {
    console.warn('Google GPT não encontrado na página');
    return;
  }

  function enviarLog(data) {
    fetch('https://seu-backend.onrender.com/log-anuncio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        console.error('Erro ao enviar log:', res.statusText);
      } else {
        console.log('📡 Log enviado:', data.adUnit);
      }
    }).catch(err => {
      console.error('Erro na requisição:', err);
    });
  }

  function verificarAnuncios() {
    const slots = googletag.pubads().getSlots();

    slots.forEach(slot => {
      const deliveredSize = slot.getTargeting('Delivered Size') || slot.getResponseInformation()?.creativeSize || 'unknown';
      const size = Array.isArray(deliveredSize) ? deliveredSize.join(',') : deliveredSize;

      if (size === 'unknown' || size === '') {
        const data = {
          timestamp: new Date().toISOString(),
          adUnit: slot.getAdUnitPath(),
          slotId: slot.getSlotElementId(),
          pageUrl: window.location.href,
          deliveredSize: size,
          userAgent: navigator.userAgent
        };
        enviarLog(data);
      }
    });
  }

  setTimeout(verificarAnuncios, 5000);
})();
