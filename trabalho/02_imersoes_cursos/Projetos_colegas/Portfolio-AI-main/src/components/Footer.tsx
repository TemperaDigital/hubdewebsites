import { motion } from 'framer-motion'
import { Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Linkedin, href: 'https://www.linkedin.com/company/hubbleai-tech/', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hubbleaitech@gmail.com', label: 'Email' },
  ]

  const footerLinks = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Team', href: '#team' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-black via-purple-900/10 to-black border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold gradient-text">Hubble AI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional AI and product development company delivering intelligent,
              scalable solutions, from small automations and machine learning workflows to full-stack,
              enterprise-grade AI platforms.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Connect With Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-3 rounded-full bg-white/5 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </motion.a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-cyan-500/20 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Hubble AI. All rights reserved. Powered by AI Innovation.
          </p>
        </div>
      </div>

      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-gradient"></div>
      </div>
    </footer>
  )
}

