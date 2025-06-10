/*
googletag.cmd.push(() => {
  googletag.pubads().addEventListener('slotRenderEnded', function (event) {
    const slot = event.slot;
    const path = window.location.pathname;
    const slot_id = slot.getSlotElementId();
    const ad_unit = slot.getAdUnitPath(); 

    const unit_sizes = slot.getSizes().map(size => {
      if (Array.isArray(size)) return size.join('x');
      if (size && typeof size.getWidth === 'function') {
        return `${size.getWidth()}x${size.getHeight()}`;
      }
      return size.toString();
    });

    let delivered_size = 'unknown';
    if (event.size) {
      delivered_size = Array.isArray(event.size)
        ? event.size.join('x')
        : event.size.toString();
    }

    let prebid_won = false;
    if (window.pbjs && pbjs.getWinningBids) {
      const winning = pbjs.getWinningBids();
      prebid_won = winning.some(bid => bid.adUnitCode === slot_id);
    }

    fetch('http://localhost:3000/api/track-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        slot_id,
        ad_unit,
        delivered_size,
        unit_sizes,
        prebid_won
      })
    })
      .then(res => res.json())
      .then(data => console.log('Dados enviados:', data))
      .catch(err => console.error('Erro ao enviar dados:', err));
  });
});
*/
(function () {
  window.googletag = window.googletag || { cmd: [] };

  function monitorSlotRender() {
    googletag.pubads().addEventListener('slotRenderEnded', function (event) {
      try {
        const slot = event.slot;
        const path = window.location.pathname;
        const slot_id = slot.getSlotElementId();
        const ad_unit = slot.getAdUnitPath();

        const unit_sizes = slot.getSizes().map(size => {
          if (Array.isArray(size)) return size.join('x');
          if (size && typeof size.getWidth === 'function') {
            return `${size.getWidth()}x${size.getHeight()}`;
          }
          return size.toString();
        });

        let delivered_size = 'unknown';
        if (event.size) {
          delivered_size = Array.isArray(event.size)
            ? event.size.join('x')
            : event.size.toString();
        }

        let prebid_won = false;
        if (window.pbjs && pbjs.getWinningBids) {
          const winning = pbjs.getWinningBids();
          prebid_won = winning.some(bid => bid.adUnitCode === slot_id);
        }

        fetch('https://monitor-anuncios-production.up.railway.app/api/track-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path,
            slot_id,
            ad_unit,
            delivered_size,
            unit_sizes,
            prebid_won
          })
        }).then(res => res.json())
          .then(data => console.log('[AdMonitor] Dados enviados:', data))
          .catch(err => console.error('[AdMonitor] Erro ao enviar dados:', err));
      } catch (e) {
        console.error('[AdMonitor] Erro geral:', e);
      }
    });
  }

  googletag.cmd.push(monitorSlotRender);
})();