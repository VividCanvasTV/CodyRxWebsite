(() => {
  const initChatWidget = () => {
    if (!document.body || document.querySelector('.cr-chat-widget')) return

    const widget = document.createElement('div')
    widget.className = 'cr-chat-widget'
    widget.innerHTML = `
      <section class="cr-chat-panel" id="cr-chat-panel" aria-hidden="true">
        <div class="cr-chat-head">
          <div class="cr-chat-head-copy">
            <p class="cr-chat-kicker">Live chat preview</p>
            <h2 class="cr-chat-title">Cody Rx chat</h2>
            <span class="cr-chat-status"><span class="cr-chat-status-dot"></span>Elegant launch placeholder</span>
          </div>
          <button type="button" class="cr-chat-close" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>
        </div>
        <div class="cr-chat-window">
          <div class="cr-chat-card">
            <span class="cr-chat-card-label">Launch styling</span>
            <p class="cr-chat-card-copy">We are getting live support ready. This preview keeps the button, motion, and chat placement polished for deployment right now.</p>
          </div>
          <div class="cr-chat-bubble-row is-incoming">
            <div class="cr-chat-bubble">Hi there. Live chat is almost ready.</div>
          </div>
          <div class="cr-chat-bubble-row is-outgoing">
            <div class="cr-chat-bubble">The real connection layer will drop into this exact window.</div>
          </div>
        </div>
        <div class="cr-chat-compose" aria-hidden="true">
          <div class="cr-chat-compose-input">Write a message</div>
          <div class="cr-chat-compose-send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M5 12h13"></path>
              <path d="M13 6l6 6-6 6"></path>
            </svg>
          </div>
        </div>
        <p class="cr-chat-note">Preview only for launch. No messages send yet.</p>
      </section>
      <button type="button" class="cr-chat-fab" aria-expanded="false" aria-controls="cr-chat-panel" aria-label="Open live chat preview">
        <span class="cr-chat-fab-orbit" aria-hidden="true"></span>
        <span class="cr-chat-fab-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <path d="M5 7.5A3.5 3.5 0 0 1 8.5 4h7A3.5 3.5 0 0 1 19 7.5v5A3.5 3.5 0 0 1 15.5 16H10l-4 4v-4.5A3.5 3.5 0 0 1 5 12.5v-5Z"></path>
          </svg>
        </span>
        <span class="cr-chat-fab-label">Live Chat</span>
      </button>
    `

    const fab = widget.querySelector('.cr-chat-fab')
    const panel = widget.querySelector('.cr-chat-panel')
    const closeButton = widget.querySelector('.cr-chat-close')

    const setOpen = (nextOpen) => {
      widget.classList.toggle('is-open', nextOpen)
      fab.setAttribute('aria-expanded', String(nextOpen))
      panel.setAttribute('aria-hidden', String(!nextOpen))
    }

    fab.addEventListener('click', () => {
      setOpen(!widget.classList.contains('is-open'))
    })

    closeButton.addEventListener('click', () => setOpen(false))

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false)
    })

    document.addEventListener('pointerdown', (event) => {
      if (!widget.contains(event.target)) setOpen(false)
    })

    document.body.appendChild(widget)

    const params = new URLSearchParams(window.location.search)
    if (params.get('chat') === 'open') {
      window.requestAnimationFrame(() => setOpen(true))
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget, { once: true })
  } else {
    initChatWidget()
  }
})()
