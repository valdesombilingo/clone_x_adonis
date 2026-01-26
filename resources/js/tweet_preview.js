// On cible le formulaire qui contient les médias
up.compiler('form[enctype="multipart/form-data"]', function (form) {
  const input = form.querySelector('input[name="mediaUrl"]')
  const previewContainer = form.querySelector('#preview-container')
  const imgPreview = form.querySelector('#image-preview')
  const videoPreview = form.querySelector('#video-preview')
  const removeBtn = form.querySelector('#remove-media')

  if (!input || !previewContainer) return

  // GESTION DU CHANGEMENT DE FICHIER
  input.addEventListener('change', function () {
    const file = this.files[0]
    if (!file) return

    if (imgPreview.src) URL.revokeObjectURL(imgPreview.src)
    if (videoPreview.src) URL.revokeObjectURL(videoPreview.src)

    const url = URL.createObjectURL(file)
    previewContainer.classList.remove('hidden')
    previewContainer.classList.add('flex')

    const isVideo = file.type.startsWith('video/')
    const mediaElement = isVideo ? videoPreview : imgPreview

    videoPreview.classList.add('hidden')
    imgPreview.classList.add('hidden')
    mediaElement.classList.remove('hidden')
    mediaElement.src = url

    const handleMetadata = () => {
      const width = isVideo ? mediaElement.videoWidth : mediaElement.naturalWidth
      const height = isVideo ? mediaElement.videoHeight : mediaElement.naturalHeight

      // 1. On s'assure que l'élément est visible en permutant les classes
      mediaElement.classList.remove('hidden')
      mediaElement.classList.add('block')

      // 2. On applique la logique de dimensionnement 2026
      if (height > width) {
        // PORTRAIT : w-auto permet au parent 'w-fit' de se resserrer sur l'image
        mediaElement.className = 'block max-h-[550px] w-auto h-auto object-contain'
      } else {
        // PAYSAGE : w-full prend la largeur maximale
        mediaElement.className = 'block w-full h-auto object-cover'
      }
    }

    if (isVideo) {
      mediaElement.onloadedmetadata = handleMetadata
    } else {
      mediaElement.onload = handleMetadata
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
  })
})
