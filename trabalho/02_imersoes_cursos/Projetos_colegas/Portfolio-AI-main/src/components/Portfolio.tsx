import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { ExternalLink, Github, X } from 'lucide-react'

export default function Portfolio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  const projects = [
    {
      title: 'HRXpert - Automating Talent Acquisition using Artificial Intelligence',
      category: 'AI Recruitment Platform',
      description: 'AI-powered recruitment automation platform managing candidate applications, resume scoring, and automated interview workflows.',
      longDescription: 'HRXpert revolutionizes the hiring process with intelligent automation. The platform uses advanced NLP for resume parsing and scoring, automated scheduling systems, and AI-driven interview workflows that reduce time-to-hire by 60%.',
      image: '/portfolio/hrxpert.webp',
      tags: ['Automation', 'NestJS', 'Next.js', 'FastAPI', 'MongoDB', 'AWS S3', 'OpenAI APIs', 'OpenAI Real-time APIs'],
      color: 'from-cyan-500 to-blue-500',
      github: "https://github.com/HRXpert",
      link: ""
    },
    {
      title: 'VizdomAI – Autonomous AI Video Generation Platform',
      category: 'AI Video Generation Platform',
      description: 'End-to-end AI platform for automated video generation, processing, and intelligent content delivery.',
      longDescription: 'VizdomAI is an autonomous AI-driven video generation platform that orchestrates multiple intelligent agents to create, process, and deliver high-quality videos at scale. It handles script understanding, video synthesis, thumbnail generation, adaptive HLS streaming, embeddings, and metadata management, all powered by a distributed microservices architecture with real-time monitoring and analytics.',
      image: '/portfolio/vizdomai.webp',
      tags: ['Generative AI', 'LangGraph', 'FastAPI', 'Next.js', 'AWS S3', 'Embeddings', 'Gemini API'],
      color: 'from-indigo-500 to-cyan-500',
      github: 'https://github.com/Vizdom-AI',
      link: ''
    },
    {
      title: 'Automated timber defect detection using Hybrid YOLO model',
      category: 'Computer Vision Solution',
      description: 'Industrial computer vision solution for defect detection and analysis with real-time processing capabilities.',
      longDescription: 'VizdomAI brings advanced computer vision to manufacturing. Using custom-trained models, it detects defects with 99.2% accuracy in real-time, providing instant feedback and detailed analytics dashboards for quality control.',
      image: '/portfolio/timberdefect.webp',
      tags: ['Computer Vision', 'PyTorch', 'FastAPI', 'YOLO', 'Machine Learning'],
      color: 'from-purple-500 to-pink-500',
      github: "https://github.com/Umar-Farooq-2112/ultralytics-custom-SPPF-transformer-and-CBAM-based-timber-defects-detection.git",
      link: "https://github.com/Umar-Farooq-2112/ultralytics-custom-SPPF-transformer-and-CBAM-based-timber-defects-detection.git"
    },
    {
      title: 'LeafLens – Plant Healths Monitoring and Guidance Platform',
      category: 'AI Agriculture & Plant Health',
      description: 'AI-powered plant health monitoring platform that analyzes leaf images to detect diseases and recommend treatments.',
      longDescription: 'LeafLens is an intelligent plant health monitoring platform that combines computer vision and generative AI to identify plant diseases from leaf images and provide actionable care guidance. It processes images in real time, classifies potential issues, explains the diagnosis in natural language, and suggests treatment and prevention steps so farmers and hobbyists can maintain crop health more effectively.',
      image: '/portfolio/leaflens.webp',
      tags: ['Computer Vision', 'Python', 'Generative AI', 'Neural Networks', 'TensorFlow', 'FastAPI', 'Next.js', 'NLP', 'Gemini API'],
      color: 'from-indigo-500 to-cyan-500',
      github: 'https://github.com/TalhaBinShahid/LeafLens.git',
      link: ''
    },
    {
      title: 'Dysarthric Speech Reconstruction Model',
      category: 'AI Speech Reconstruction',
      description: 'Deep learning model that reconstructs clearer, more intelligible speech from dysarthric audio recordings.',
      longDescription: 'This project focuses on accessibility by reconstructing intelligible speech from dysarthric or highly impaired audio. Using a GAN-based architecture and neural speech processing techniques, the model learns to map distorted speech patterns to a cleaner acoustic representation while preserving speaker identity, helping improve communication for patients with motor speech disorders.',
      image: '/portfolio/speechreconstruction.webp',
      tags: ['Python', 'GANs', 'Speech Processing', 'Neural Networks', 'Deep Learning'],
      color: 'from-indigo-500 to-cyan-500',
      github: 'https://github.com/TalhaBinShahid/Speech-Reconstruction-GAN-Model.git',
      link: ''
    },
  ]

  const selected = selectedProject !== null ? projects[selectedProject] : null

  return (
    <section id="portfolio" ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Our Portfolio</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A snapshot of the AI products, platforms, and experiments we've done so far
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedProject(index)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-sm text-cyan-400 mb-2">{project.category}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">{project.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                {/* <span className="text-white font-semibold">View Details</span> */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl w-full bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="relative h-64">
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${selected.color} opacity-30`}></div>
            </div>

            <div className="p-8">
              <div className="text-sm text-cyan-400 mb-2">{selected.category}</div>
              <h3 className="text-3xl font-bold text-white mb-4">{selected.title}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed text-lg">{selected.longDescription}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-4">
                {selected.link && (
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Project
                  </a>
                )}
                {selected.github && (
                  <a
                    href={selected.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 border border-cyan-500/50 rounded-full font-semibold hover:bg-cyan-500/10 transition-all"
                  >
                    <Github className="w-5 h-5" />
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

