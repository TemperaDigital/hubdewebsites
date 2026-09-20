import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Briefcase, Users, Rocket, TrendingUp } from 'lucide-react'

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    {
      icon: Briefcase,
      value: 20,
      suffix: '+',
      label: 'Products Delivered',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Users,
      value: 5,
      suffix: '+',
      label: 'Clients Served',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Rocket,
      value: 10,
      suffix: '+',
      label: 'AI Workflows Automated',
      color: 'from-green-400 to-teal-500',
    },
    {
      icon: TrendingUp,
      value: 100,
      suffix: '%',
      label: 'Client Satisfaction',
      color: 'from-orange-400 to-red-500',
    },
  ]

  return (
    <section id="stats" ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Our Impact</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Delivering measurable results and building lasting partnerships
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <StatCard 
                key={stat.label} 
                stat={stat} 
                Icon={Icon} 
                index={index} 
                isInView={isInView}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, Icon, index, isInView }: any) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = stat.value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= stat.value) {
        setCount(stat.value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, stat.value])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 text-center overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

        {/* Icon */}
        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Animated counter */}
        <div className="relative z-10">
          <motion.div
            className="text-5xl font-bold gradient-text mb-2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          >
            {count}{stat.suffix}
          </motion.div>
          <p className="text-gray-400 font-semibold">{stat.label}</p>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.2)',
          }}
        ></div>
      </div>
    </motion.div>
  )
}

