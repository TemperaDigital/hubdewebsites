import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { MessageSquare, Lightbulb, Code2, Rocket, BarChart3, Wrench } from 'lucide-react'

export default function Process() {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: '-100px' })

  const steps = [
    {
      icon: MessageSquare,
      title: 'Discovery & Consultation',
      description: 'We start by understanding your business needs, challenges, and goals through detailed discussions.',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Lightbulb,
      title: 'Strategy & Planning',
      description: 'Design a comprehensive roadmap with technical architecture, timelines, and success metrics.',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Code2,
      title: 'Development & Integration',
      description: 'Build your solution with agile methodology, regular updates, and continuous feedback loops.',
      color: 'from-green-400 to-teal-500',
    },
    {
      icon: Rocket,
      title: 'Testing & Deployment',
      description: 'Rigorous testing, optimization, and smooth deployment to production environments.',
      color: 'from-orange-400 to-red-500',
    },
    {
      icon: BarChart3,
      title: 'Monitoring & Analytics',
      description: 'Track performance metrics, gather insights, and ensure optimal system operation.',
      color: 'from-indigo-400 to-purple-500',
    },
    {
      icon: Wrench,
      title: 'Support & Iteration',
      description: 'Ongoing maintenance, updates, and iterative improvements based on user feedback.',
      color: 'from-pink-400 to-rose-500',
    },
  ]

  return (
    <section id="process" ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-900/5 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">How We Work</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our proven process takes you from idea to production, ensuring high-quality AI and ML solutions shipped on time and ready to scale.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 transform -translate-x-1/2"></div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isEven ? -120 : 120 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ amount: 0.5, once: false }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'} text-center lg:text-inherit`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-block lg:block"
                    >
                      <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0 lg:ml-auto">{step.description}</p>
                    </motion.div>
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative flex-shrink-0 p-6 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}
                    style={{ width: '80px', height: '80px' }}
                  >
                    <Icon className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-black border-2 border-cyan-400 rounded-full flex items-center justify-center text-cyan-400 font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} blur-xl opacity-50 -z-10`}></div>
                  </motion.div>

                  {/* Spacer for alignment */}
                  <div className="flex-1 hidden lg:block"></div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

