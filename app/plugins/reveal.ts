export default defineNuxtPlugin((nuxtApp) => {
  let io: IntersectionObserver | null = null

  const getIO = () => {
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            e.target.classList.add(
              e.target.classList.contains('rv-lines') ? 'is-lines-in' : 'is-visible',
            )
            io!.unobserve(e.target)
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
      )
    }
    return io
  }

  const scan = () => {
    if (!import.meta.client) return
    document
      .querySelectorAll('.reveal:not(.is-visible), .reveal-group:not(.is-visible), .rv-lines:not(.is-lines-in)')
      .forEach((el) => getIO().observe(el))
  }

  nuxtApp.hook('app:mounted', scan)
  nuxtApp.hook('page:finish', scan)

  nuxtApp.vueApp.directive('revealLines', {
    mounted(el: HTMLElement) {
      el.classList.add('rv-lines')
      const frag = document.createDocumentFragment()
      let buf: Node[] = []
      let i = 0
      const flush = () => {
        if (!buf.length) return
        const mask = document.createElement('span')
        mask.className = 'rv-line'
        const inner = document.createElement('span')
        inner.className = 'rv-line-in'
        inner.style.setProperty('--i', String(i++))
        for (const n of buf) inner.appendChild(n)
        mask.appendChild(inner)
        frag.appendChild(mask)
        buf = []
      }
      for (const node of Array.from(el.childNodes)) {
        if (node.nodeName === 'BR') {
          flush()
          frag.appendChild(document.createElement('br'))
        } else {
          buf.push(node)
        }
      }
      flush()
      el.textContent = ''
      el.appendChild(frag)
      getIO().observe(el)
    },
  })
})
