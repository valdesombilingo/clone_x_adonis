import 'emoji-picker-element'

up.compiler('form', function (form) {
  const emojiButton = form.querySelector('#emoji-button')
  const pickerContainer = form.querySelector('#emoji-picker-container')
  const textarea = form.querySelector('textarea[name="content"]')
  const picker = form.querySelector('emoji-picker')

  if (!emojiButton || !pickerContainer || !textarea || !picker) return

  // 1. Ouvrir / Fermer le menu
  const togglePicker = (e) => {
    e.stopPropagation()
    pickerContainer.classList.toggle('hidden')
  }
  emojiButton.addEventListener('click', togglePicker)

  // 2. Insérer l'émoji
  const insertEmoji = (event) => {
    const emoji = event.detail.unicode
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    textarea.value = textarea.value.substring(0, start) + emoji + textarea.value.substring(end)

    textarea.focus()
    textarea.selectionEnd = start + emoji.length
    pickerContainer.classList.add('hidden')
  }
  picker.addEventListener('emoji-click', insertEmoji)

  // 3. Fermer si on clique à l'extérieur
  const closeOnClickOutside = (e) => {
    if (!pickerContainer.contains(e.target) && !emojiButton.contains(e.target)) {
      pickerContainer.classList.add('hidden')
    }
  }
  document.addEventListener('click', closeOnClickOutside)

  // Nettoyage listener global
  return () => {
    document.removeEventListener('click', closeOnClickOutside)
  }
})
