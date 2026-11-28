(() => {
  const section = document.querySelector('#clinic-video');
  if (!section) return;

  const trigger = section.querySelector('.clinic-video-trigger');
  const player = section.querySelector('video');
  const status = section.querySelector('.clinic-video-status');

  trigger.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    status.hidden = true;
    trigger.hidden = true;
    player.hidden = false;
    player.src = trigger.href;
    player.focus({preventScroll: true});
    player.play().catch(() => {});
  });

  player.addEventListener('error', () => {
    const playerHasFocus = document.activeElement === player;
    player.removeAttribute('src');
    player.load();
    player.hidden = true;
    trigger.hidden = false;
    status.hidden = false;
    if (playerHasFocus) trigger.focus({preventScroll: true});
  });
})();
