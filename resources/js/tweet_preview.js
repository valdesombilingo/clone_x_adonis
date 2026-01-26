// On cible le formulaire qui contient les médias
up.compiler('form[enctype="multipart/form-data"]', function (form) {
  const input = form.querySelector('input[name="mediaUrl"]')
  const previewContainer = form.querySelector('#preview-container')
  const imgPreview = form.querySelector('#image-preview')
  const videoPreview = form.querySelector('#video-preview')
  const removeBtn = form.querySelector('#remove-media')
  const jsErrorContainer = form.querySelector('#js-media-error')

  if (!input || !previewContainer) return

  // GESTION DU CHANGEMENT DE FICHIER
  input.addEventListener('change', function () {
    const file = this.files[0] // On récupère le premier fichier
    if (!file) return

    // --- SÉCURITÉ TAILLE DE FICHIER (50 Mo) ---
    const maxSize = 50 * 1024 * 1024 // 50 Megabytes
    if (file.size > maxSize) {
      // Affichage du message d'erreur dans le HTML
      if (jsErrorContainer) {
        jsErrorContainer.textContent = `Le fichier "${file.name}" est trop lourd (Maximum 50 Mo).`
        jsErrorContainer.classList.remove('hidden')
      }

      this.value = '' // Réinitialise l'input
      previewContainer.classList.add('hidden')
      previewContainer.classList.remove('flex')
      return
    } else {
      // Si le fichier est valide, on cache l'erreur JS
      if (jsErrorContainer) {
        jsErrorContainer.classList.add('hidden')
        jsErrorContainer.textContent = ''
      }
    }

    // Nettoyage des anciennes URLs pour éviter les fuites mémoire
    if (imgPreview.src) URL.revokeObjectURL(imgPreview.src)
    if (videoPreview.src) URL.revokeObjectURL(videoPreview.src)

    const url = URL.createObjectURL(file)
    previewContainer.classList.remove('hidden')
    previewContainer.classList.add('flex')

    const isVideo = file.type.startsWith('video/')
    const mediaElement = isVideo ? videoPreview : imgPreview

    // On cache les deux par défaut avant d'afficher le bon
    videoPreview.classList.add('hidden')
    imgPreview.classList.add('hidden')

    mediaElement.src = url

    const handleMetadata = () => {
      const width = isVideo ? mediaElement.videoWidth : mediaElement.naturalWidth
      const height = isVideo ? mediaElement.videoHeight : mediaElement.naturalHeight

      // 1. On affiche l'élément sélectionné
      mediaElement.classList.remove('hidden')
      mediaElement.classList.add('block')

      // 2. Logique de dimensionnement 2026
      if (height > width) {
        // PORTRAIT
        mediaElement.className = 'block max-h-[550px] w-auto h-auto object-contain'
      } else {
        // PAYSAGE
        mediaElement.className = 'block w-full h-auto object-cover'
      }
    }

    if (isVideo) {
      mediaElement.onloadedmetadata = handleMetadata
    } else {
      mediaElement.onload = handleMetadata
    }
  })

  // SÉCURITÉ À LA SOUMISSION DU FORMULAIRE
  form.addEventListener('submit', (event) => {
    const file = input.files[0]
    if (file && file.size > 50 * 1024 * 1024) {
      event.preventDefault()
      if (jsErrorContainer) {
        jsErrorContainer.textContent = "L'envoi a été annulé : le fichier dépasse 50 Mo."
        jsErrorContainer.classList.remove('hidden')
      }
    }
  })

  // GESTION DU BOUTON SUPPRIMER
  removeBtn.addEventListener('click', () => {
    if (imgPreview.src) URL.revokeObjectURL(imgPreview.src)
    if (videoPreview.src) URL.revokeObjectURL(videoPreview.src)
    input.value = ''
    previewContainer.classList.add('hidden')
    previewContainer.classList.remove('flex')
    imgPreview.src = ''
    videoPreview.src = ''

    // On efface aussi l'erreur quand on supprime le média
    if (jsErrorContainer) {
      jsErrorContainer.classList.add('hidden')
      jsErrorContainer.textContent = ''
    }
  })
})
