import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Linkedin, Github, Globe2 } from 'lucide-react'

export default function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const team = [
    {
      name: 'Umar Farooq',
      role: 'Full Stack AI Engineer',
      bio: 'AI and full-stack engineer focused on building production-ready intelligent systems and scalable platforms.',
      image: '/team/umar.webp',
      social: {
        linkedin: 'www.linkedin.com/in/umarrfarooq',
        github: 'https://github.com/Umar-Farooq-2112',
        portfolio: 'https://umarfarooq.tech',
      },
    },
    {
      name: 'Talha Bin Shahid',
      role: 'AI Automations Engineer',
      bio: 'Automation and agentic AI engineer building end-to-end workflows, integrations, and internal tools.',
      image: '/team/talha.webp',
      social: {
        linkedin: 'https://www.linkedin.com/in/raja-talha/',
        github: 'https://github.com/TalhaBinShahid',
        portfolio: '#',
      },
    },
    {
      name: 'Mahnoor Sadaqat',
      role: 'Full Stack Developer',
      bio: 'Full-stack developer crafting modern, responsive interfaces for data-heavy and AI-powered products.',
      image: '/team/mahnoor.webp',
      social: {
        linkedin: 'https://www.linkedin.com/in/mahnoor-sadaqat/',
        github: 'https://github.com/MahnoorSadaqat',
        portfolio: '#',
      },
    },
  ]

  return (
    <section id="team" ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Our Team</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the AI and machine learning experts, engineers, and product builders behind Hubble AI's intelligent solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  
                  {/* Social links - show on hover */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <motion.a
                      href={member.social.linkedin}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-cyan-500/20 rounded-full hover:bg-cyan-500/30 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-cyan-400" />
                    </motion.a>
                    <motion.a
                      href={member.social.github}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-cyan-500/20 rounded-full hover:bg-cyan-500/30 transition-colors"
                    >
                      <Github className="w-5 h-5 text-cyan-400" />
                    </motion.a>
                    {member.social.portfolio && member.social.portfolio !== '#' && (
                      <motion.a
                        href={member.social.portfolio}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-cyan-500/20 rounded-full hover:bg-cyan-500/30 transition-colors"
                      >
                        <Globe2 className="w-5 h-5 text-cyan-400" />
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  {member.role && (
                    <p className="text-cyan-400 font-semibold mb-3">{member.role}</p>
                  )}
                  <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: '0 0 40px rgba(56, 189, 248, 0.2)',
                  }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

