// Bouton de retour
document.addEventListener('click', (event) => {
  const backBtn = event.target.closest('[data-back]')

  if (backBtn) {
    event.preventDefault()

    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = backBtn.getAttribute('data-back') || '/'
    }
  }
})
