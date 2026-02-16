// Auto-resize des textarea pour les tweets
document.addEventListener('input', (e) => {
  if (e.target.matches('.tweet-textarea')) {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }
})

// Activation/désactivation du bouton "Poster" dans les formulaires de tweet
function validateForm(form) {
  const textarea = form.querySelector('.js-input-content')
  const fileInput = form.querySelector('.js-input-file')
  const submitBtn =
    form.querySelector('.js-btn-poster') ||
    document.querySelector(`.js-btn-poster[form="${form.id}"]`)

  if (!submitBtn) return

  const hasText = textarea && textarea.value.trim().length > 0
  const hasFile = fileInput && fileInput.files && fileInput.files.length > 0

  submitBtn.disabled = !(hasText || hasFile)
}

;['input', 'change'].forEach((type) => {
  document.addEventListener(type, (event) => {
    const form = event.target.closest('.js-form-tweet')
    if (form) validateForm(form)
  })
})

// Gestion de la suppression du média sur l'aperçu
document.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('#remove-media')
  if (!removeBtn) return

  const form = removeBtn.closest('.js-form-tweet')
  if (form) {
    const fileInput = form.querySelector('.js-input-file')

    // 1. On vide l'input file (crucial pour le bouton Poster)
    if (fileInput) fileInput.value = ''

    // 2. On cache l'aperçu (ton code actuel doit déjà faire ça)
    const previewContainer = form.querySelector('#preview-container')
    if (previewContainer) previewContainer.classList.add('hidden')

    // 3. On force la re-validation du bouton "Poster"
    validateForm(form)
  }
})
