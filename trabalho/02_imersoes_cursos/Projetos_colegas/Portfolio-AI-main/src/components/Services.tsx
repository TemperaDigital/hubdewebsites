import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Bot, Code, Brain, Rocket, Database, Workflow, Smartphone, ServerCog } from 'lucide-react'

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const services = [
    {
      icon: Bot,
      title: 'AI Automation & Intelligent Agents',
      description: 'Design AI workflows, chatbots, voice agents, and agentic systems to automate internal operations, HR workflows, and customer support.',
      features: ['Chatbots & Voice Agents', 'Agentic Workflows', 'Operations & HR Automation'],
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Brain,
      title: 'AI Product Development',
      description: 'End-to-end AI product lifecycle from idea to production. NLP, Computer Vision, and multimodal AI tailored to your use cases.',
      features: ['NLP & Computer Vision', 'Product Architecture', 'Production Deployment'],
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Code,
      title: 'Full-Stack Web Development',
      description: 'Modern web and software platforms with Next.js, NestJS, FastAPI, and MongoDB. Seamless integration of AI models and intelligent agents.',
      features: ['Next.js Frontends', 'NestJS & FastAPI Backends', 'AI-Powered Dashboards'],
      color: 'from-green-400 to-teal-500',
    },
    {
      icon: Database,
      title: 'Data Scraping, Analysis & Insights',
      description: 'Web and data scraping, exploratory analysis, dashboards, and reports to help you understand and act on your data.',
      features: ['Web & Data Scraping', 'Exploratory Data Analysis (EDA)', 'Analytics Dashboards & Reporting'],
      color: 'from-orange-400 to-red-500',
    },
    {
      icon: Workflow,
      title: 'Machine Learning Systems & MLOps',
      description: 'End-to-end machine learning solutions: data pipelines, model training, evaluation, deployment, and continuous improvement.',
      features: ['Model Development & Optimization', 'MLOps Pipelines', 'Monitoring & Retraining'],
      color: 'from-indigo-400 to-purple-500',
    },
    {
      icon: Rocket,
      title: 'AI Consulting & Strategy',
      description: 'Strategic guidance on AI and ML adoption, data strategy, architecture, and infrastructure decisions.',
      features: ['AI & ML Strategy', 'Feasibility Analysis', 'Technical Roadmaps'],
      color: 'from-pink-400 to-rose-500',
    },
    {
      icon: Smartphone,
      title: 'Mobile Application Development',
      description: 'Design and develop high-performance mobile applications for iOS and Android with seamless UX, offline support, and secure integrations.',
      features: ['iOS & Android Apps', 'Flutter & Cross-Platform', 'API & Third-Party Integrations'],
      color: 'from-emerald-400 to-cyan-500',
    },
    {
      icon: ServerCog,
      title: 'DevOps, Cloud & Infrastructure',
      description: 'Automate delivery pipelines, improve reliability, and scale confidently with modern DevOps practices and cloud-native infrastructure.',
      features: ['CI/CD Pipelines & Automation', 'Cloud Infrastructure (AWS, Azure, GCP)', 'Monitoring, Logging & Cost Optimization'],
      color: 'from-slate-400 to-cyan-500',
    },
  ]

  return (
    <section id="services" ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-900/5 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Our Services</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            End-to-end AI and product development expertise, from small automations to enterprise solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  }}
                ></div>

                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${service.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{service.description}</p>

                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: '0 0 40px rgba(56, 189, 248, 0.2)',
                  }}
                ></div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

