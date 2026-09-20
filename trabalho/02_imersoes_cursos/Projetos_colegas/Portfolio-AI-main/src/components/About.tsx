import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Sparkles, Target, Users, Zap } from 'lucide-react'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const values = [
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Continuously pushing AI boundaries to build advanced solutions',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: Target,
      title: 'Impact',
      description: 'Delivering products that solve real-world business problems',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Sparkles,
      title: 'Excellence',
      description: 'High standards for software engineering, AI design, and deployment',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Partnering with clients to turn their ideas into scalable AI solutions',
      color: 'from-green-400 to-teal-500',
    },
  ]

  return (
    <section id="about" ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">About Hubble AI</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-20 px-6"
        >
          <p className="text-xl text-gray-300 leading-relaxed text-center mb-8">
            Hubble AI is a professional AI and product development company focused on delivering
            intelligent, scalable, and high-impact solutions that empower businesses, startups, and innovators.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed text-center">
            Our mission is to transform ideas into AI-driven products and systems that solve
            real-world problems, streamline workflows, and enable smarter decision-making. Hubble AI
            combines deep expertise in machine learning engineering, agentic AI, and full-stack
            development, allowing us to handle projects ranging from{' '}
            <span className="text-cyan-400 font-semibold">small AI automations</span> to{' '}
            <span className="text-purple-400 font-semibold">full-scale enterprise platforms</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 text-center"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${value.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

