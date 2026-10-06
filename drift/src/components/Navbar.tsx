import { useEffect, useRef, useState } from 'react'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#drift-ai', label: 'Drift AI' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="absolute left-1/2 top-6 z-50 -translate-x-1/2">
      <div className="flex items-center gap-6 rounded-full bg-white px-5 py-3 shadow-lg">
        <span className="text-lg font-bold tracking-tight text-black">Drift.</span>
        <button
          type="button"
          className="relative h-3 w-5"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className={`absolute left-0 top-0 block h-[2px] w-5 bg-black transition-transform duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              open ? 'translate-y-[5px] rotate-45' : ''
            }`}
          />
          <span
            className={`absolute bottom-0 left-0 block h-[2px] w-5 bg-black transition-transform duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] ${
              open ? '-translate-y-[5px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      <div
        id="nav-menu"
        className={`absolute left-0 right-0 top-full z-50 mt-3 origin-top rounded-2xl bg-white p-2 shadow-lg transition duration-200 ease-out ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 animate-fade-in-down opacity-100'
            : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
        }`}
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-black/5"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
