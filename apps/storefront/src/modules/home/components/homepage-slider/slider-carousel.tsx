"use client"

import { useEffect, useRef, useState } from "react"
import { HomepageSlider } from "@lib/data/homepage-sliders"

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

export default function SliderCarousel({ sliders }: { sliders: HomepageSlider[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prev = () => setCurrent((i) => (i === 0 ? sliders.length - 1 : i - 1))
  const next = () => setCurrent((i) => (i === sliders.length - 1 ? 0 : i + 1))

  useEffect(() => {
    if (paused || sliders.length <= 1) return
    timerRef.current = setTimeout(next, 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, paused, sliders.length])

  if (!sliders.length) return null

  const slider = sliders[current]

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      style={{ height: "480px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide image */}
      {slider.image && (
        <img
          key={slider.id}
          src={slider.image}
          alt={slider.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center text-white">
        <h2 className="text-4xl font-bold drop-shadow-lg max-w-2xl leading-tight">
          {slider.name}
        </h2>
        {slider.banner_link && (
          <a
            href={slider.banner_link}
            target={slider.open_in_new_window ? "_blank" : "_self"}
            rel={slider.open_in_new_window ? "noopener noreferrer" : undefined}
            className="inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </a>
        )}
      </div>

      {/* Prev / Next arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/40 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/40 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {sliders.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {sliders.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}