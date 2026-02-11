document.addEventListener('click', (event) => {
  // On vérifie si on a cliqué sur le bouton ou sur l'icône à l'intérieur
  const button = event.target.closest('[data-toggle-password]')

  if (button) {
    const input = button.parentElement.querySelector('input')
    const icon = button.querySelector('i')

    const isPassword = input.type === 'password'
    input.type = isPassword ? 'text' : 'password'

    // Bascule des icônes
    if (isPassword) {
      icon.classList.replace('fa-eye', 'fa-eye-slash')
    } else {
      icon.classList.replace('fa-eye-slash', 'fa-eye')
    }
  }
})
