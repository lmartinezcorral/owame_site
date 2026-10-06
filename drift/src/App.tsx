import AboutSection from './components/AboutSection'
import FeaturesSection from './components/FeaturesSection'
import Navbar from './components/Navbar'

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260711_090308_1dd0cea7-f9ba-4db4-8147-c7d746061c9e.mp4'

export default function App() {
  return (
    <main>
      <section id="top" className="relative mb-[-25px] h-screen overflow-hidden">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/20" />
        <Navbar />

        <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-12 text-center md:pb-16">
          <h1 className="text-5xl font-normal leading-[1.1] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[96px]">
            <span className="block">Own your time</span>
            <span className="block">
              without{' '}
              <em
                className="not-italic"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}
              >
                the stress
              </em>
            </span>
          </h1>
          <p className="mt-5 max-w-[420px] text-sm font-medium text-white/80 md:text-base">
            Drift is a calm, ADHD-friendly planner that turns scattered ideas into a clear path
          </p>
          <div className="mt-6 flex items-center gap-4 rounded-xl bg-black/25 py-1 pl-6 pr-1 backdrop-blur-md">
            <p className="hidden text-sm font-medium text-white sm:block">
              No noise. No complicated systems. Just your day, gently sorted.
            </p>
            <p className="text-sm font-medium text-white sm:hidden">No noise. Just your day, gently sorted.</p>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Start for free
            </button>
          </div>
        </div>
      </section>

      <AboutSection />
      <FeaturesSection />
    </main>
  )
}
