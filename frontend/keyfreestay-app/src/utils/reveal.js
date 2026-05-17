// Global reveal-on-scroll observer.
// Scans `.reveal` nodes and toggles `.revealed` when they enter viewport.
// Uses MutationObserver so dynamically rendered React nodes are picked up.

let io = null
let mo = null
let started = false

function ensureObserver() {
  if (io) return io
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          io.unobserve(e.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -64px 0px' }
  )
  return io
}

function observeNew(root) {
  const els = (root === document ? document : root).querySelectorAll?.('.reveal:not(.revealed)')
  if (!els) return
  const obs = ensureObserver()
  els.forEach(el => obs.observe(el))
}

export function startRevealObserver() {
  if (started || typeof window === 'undefined') return
  started = true
  observeNew(document)
  mo = new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return
        if (n.classList?.contains('reveal')) ensureObserver().observe(n)
        observeNew(n)
      })
    }
  })
  mo.observe(document.body, { childList: true, subtree: true })
}
