import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'

type Testimonial = {
  name: string
  company: string
  content: string
  image: string
  rating: number
  role?: string
}

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      name: 'Jordan Zietz',
      company: 'Brackot Company',
      // role: 'Founder, Brackot Company',
      content: 'From understanding our requirements to deploying a reliable model, the process was smooth, transparent, and professional. The final result exceeded expectations and added clear value to our operations.',
      image: 'https://www.upwork.com/profile-portraits/c1zJWGmy9XD_AyegTj2ysdZ0ECiWs7QqNSpC-DGf_ryF9QQiHA38wHENtMoZhqiSw1',
      rating: 5,
    },
    {
      name: 'Mesut Yilmaz',
      company: 'AI Navigator, Germany',
      content: 'HubbleAI did a great job helping us to scrape relevant data for our AI Solution. They have good hands on data research and engineering.',
      image: '',
      rating: 5,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section id="testimonials" ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-900/5 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Client Testimonials</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Hear what our clients say about working with us
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative p-8 md:p-12 rounded-2xl bg-white/5 backdrop-blur-sm border border-cyan-500/20"
            >
              {/* Quote icon */}
              <div className="absolute top-8 left-8 opacity-20">
                <Quote className="w-16 h-16 text-cyan-400" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 italic">
                  "{testimonials[currentIndex].content}"
                </p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[currentIndex].image ?? '/avatar-fallback.svg'}
                    alt={testimonials[currentIndex].name}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      if (!target.src.includes('avatar-fallback.svg')) {
                        target.src = '/avatar-fallback.svg'
                      }
                    }}
                    className="w-16 h-16 rounded-full border-2 border-cyan-500/50"
                  />
                  <div>
                    <h4 className="text-white font-bold text-lg">{testimonials[currentIndex].name}</h4>
                    {testimonials[currentIndex].role && (
                      <p className="text-cyan-400">{testimonials[currentIndex].role}</p>
                    )}
                    <p className="text-gray-400 text-sm">{testimonials[currentIndex].company}</p>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-white/5 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-cyan-400" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-cyan-400' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-white/5 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"
            >
              <ChevronRight className="w-6 h-6 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

