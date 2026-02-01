export class ProfilePreview {
  constructor(container) {
    // Container du compiler
    this.container = container
    this.cropper = null
    this.currentInput = null
    this.currentPreviewId = null

    this.modal = document.getElementById('cropper-modal')
    this.cropperImg = document.getElementById('cropper-image')

    if (!this.modal || !this.cropperImg) return

    this.initEventListeners()
  }

  initEventListeners() {
    // L'écouteur sur le container pour les changements d'input
    this.container.addEventListener('change', (e) => {
      if (e.target.classList.contains('profile-upload-input')) {
        this.openCropper(e)
      }
    })

    // Gestion des suppressions
    this.container.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.profile-delete-btn')
      if (deleteBtn) this.handleDeletion(deleteBtn)
    })

    // Boutons du modal (Hors container souvent)
    this.confirmBtn = document.getElementById('confirm-crop')
    this.cancelBtn = document.getElementById('cancel-crop')

    // Fonctions fléchées nommées pour pouvoir les remove
    this._onConfirm = () => this.applyCrop()
    this._onCancel = () => this.closeModal()

    this.confirmBtn?.addEventListener('click', this._onConfirm)
    this.cancelBtn?.addEventListener('click', this._onCancel)
  }

  // Méthode de nettoyage
  destroy() {
    this.confirmBtn?.removeEventListener('click', this._onConfirm)
    this.cancelBtn?.removeEventListener('click', this._onCancel)
    if (this.cropper) this.cropper.destroy()
  }

  openCropper(event) {
    const input = event.target
    if (input.files && input.files[0]) {
      this.currentInput = input
      this.currentPreviewId = input.dataset.preview

      const reader = new FileReader()
      reader.onload = (e) => {
        // On réinitialise l'image avant de changer la source
        if (this.cropper) {
          this.cropper.destroy()
          this.cropper = null
        }

        this.cropperImg.src = e.target.result

        // Affichage pour que Cropper puisse calculer les dimensions
        this.modal.classList.remove('hidden')
        this.modal.classList.add('flex')

        const ratio = this.currentPreviewId.includes('avatar') ? 1 : 3 / 1

        this.cropper = new Cropper(this.cropperImg, {
          aspectRatio: ratio,
          viewMode: 2,
          background: false,
          dragMode: 'move',
          autoCropArea: 1,
          restore: false,
          guides: false,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
        })
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  applyCrop() {
    if (!this.cropper) return

    const isAvatar = this.currentPreviewId.includes('avatar')
    const canvas = this.cropper.getCroppedCanvas({
      width: isAvatar ? 400 : 1500,
      height: isAvatar ? 400 : 500,
    })

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        const file = new File([blob], `${this.currentPreviewId}.jpg`, { type: 'image/jpeg' })
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        this.currentInput.files = dataTransfer.files

        const previewElement = document.getElementById(this.currentPreviewId)
        if (previewElement) previewElement.src = canvas.toDataURL('image/jpeg')

        // Marquer comme non-supprimé
        const type = this.currentInput.name // 'avatar' ou 'banner'
        const deleteInput = document.getElementById(
          `delete${type.charAt(0).toUpperCase() + type.slice(1)}Input`
        )
        if (deleteInput) deleteInput.value = 'false'

        this.closeModal()
      },
      'image/jpeg',
      0.9
    )
  }

  handleDeletion(btn) {
    const type = btn.dataset.type // 'Avatar' ou 'Banner'
    const previewId = btn.dataset.preview
    const deleteInput = document.getElementById(`delete${type}Input`)
    if (deleteInput) deleteInput.value = 'true'

    const previewElement = document.getElementById(previewId)
    if (previewElement) {
      previewElement.src =
        type === 'Avatar'
          ? '/images/backgrounds/default-profile-avatar.png'
          : '/images/backgrounds/defaut-profile-banner.png'
    }
  }

  closeModal() {
    this.modal.classList.replace('flex', 'hidden')
    if (this.cropper) {
      this.cropper.destroy()
      this.cropper = null
    }
  }
}

// Initialisation
up.compiler('.profile-edit-container', (element) => {
  const instance = new ProfilePreview(element)
  return () => instance.destroy() // Nettoyage automatique
})
