import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'

const features = [
  {
    title: 'Built for ease, not urgency',
    description:
      'Drift strips away the noise that makes organizing feel draining. Every surface is made to be soft, quiet, and intuitive so you can move forward, not get stuck decoding.',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4',
  },
  {
    title: 'The gentlest way to start',
    description:
      'Beginning your day should feel natural, not daunting. Drift eases you into motion with subtle cues and a quiet view of what deserves your energy right now.',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260625_174131_395bc785-bb21-4e65-abf6-27c56f0764b6.mp4',
  },
  {
    title: 'Deep, undivided focus',
    description:
      'No interruptions, no clutter. Drift holds you in the present task with a stripped-back layout that softens all else until you are truly ready to shift.',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260525_052706_d2e390fd-1846-4fe7-a4d8-8d2f1c875358.mp4',
  },
]

const background =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260709_082449_46df5cc4-ad98-4541-9236-a2659c1478a4.png&w=1920&q=85'

export default function FeaturesSection() {
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [revealed, setRevealed] = useState<boolean[]>(() => features.map(() => false))

  useEffect(() => {
    const cards = cardRefs.current.filter((card): card is HTMLElement => card !== null)

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = Number((entry.target as HTMLElement).dataset.index)
          setActive(index)
        })
      },
      { threshold: 0.6 },
    )

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = Number((entry.target as HTMLElement).dataset.index)
          setRevealed((current) => {
            if (current[index]) return current
            const next = [...current]
            next[index] = true
            return next
          })
          revealObserver.unobserve(entry.target)
        })
      },
      { threshold: 0.15 },
    )

    cards.forEach((card) => {
      activeObserver.observe(card)
      revealObserver.observe(card)
    })

    return () => {
      activeObserver.disconnect()
      revealObserver.disconnect()
    }
  }, [])

  const scrollToCard = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section id="features" className="relative px-5 py-20 md:px-10 md:py-40 lg:px-16 lg:py-48">
      <img src={background} alt="" className="fixed inset-0 -z-10 h-full w-full object-cover" />

      <div className="grid lg:grid-cols-[400px_1fr] lg:gap-24 xl:grid-cols-[460px_1fr] xl:gap-48">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:py-32">
          <h2 className="text-2xl font-normal leading-[1.2] text-white sm:text-3xl lg:text-[46px]">
            Software that flows with your mind, not over it
          </h2>

          <div className="mt-8 hidden flex-col gap-2 lg:mt-0 lg:flex">
            {features.map((feature, index) => (
              <button
                key={feature.title}
                type="button"
                onClick={() => scrollToCard(index)}
                className={`rounded-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  active === index ? 'bg-black/20 text-white' : 'bg-black/20 text-white/40'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          <div className="mt-8 hidden items-center gap-4 rounded-xl bg-black/25 py-1 pl-6 pr-1 backdrop-blur-md lg:mt-0 lg:flex">
            <p className="text-sm font-medium text-white">
              No noise. No complicated systems. Just your day, gently sorted.
            </p>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Start for free
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-16 lg:mt-0 lg:gap-24">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              data-index={index}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
              className={`rounded-3xl bg-black/20 p-6 backdrop-blur-sm transition-all duration-700 ease-out md:p-10 ${
                revealed[index] ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
              }`}
            >
              <Logo fill="rgba(255,255,255,0.8)" />
              <h3 className="mt-6 text-xl font-medium text-white md:text-2xl">{feature.title}</h3>
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-black/30">
                <video
                  className="h-full w-full object-cover"
                  src={feature.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
              <p className="mt-6 text-sm font-medium leading-relaxed text-white/60 md:text-base">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
