
document.querySelectorAll('.platform-tab').forEach(tab =>
  tab.addEventListener('click', () => {
    document
      .querySelectorAll('.platform-tab')
      .forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  })
);

const publishBtn = document.getElementById('publish-btn');
document
  .querySelectorAll('input[name="publish-option"]')
  .forEach(opt =>
    opt.addEventListener('change', () =>
      (publishBtn.textContent =
        opt.value === 'now' ? 'Publish' : 'Schedule'))
  );

publishBtn.addEventListener('click', () =>
  requireConnection(() => {
    const selected =
      document.querySelector('input[name="publish-option"]:checked').value;
    const platform =
      document.querySelector('.platform-tab.active').textContent;

    alert(
      selected === 'now'
        ? `Publishing to ${platform} now!`
        : `Scheduling post for ${platform}…`
    );
  })
);

document
  .querySelector('.btn-secondary')
  .addEventListener('click', () => alert('Opening post editor…'));
