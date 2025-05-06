"use client" // Keep this if using Next.js App Router

import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from "lucide-react"
import { motion } from "framer-motion"

const Footer = ({ className = "" }) => {
  // Footer component remains largely the same, focusing on its own content and style.
  // The animation should work fine as an entrance effect.
  return (
    <motion.footer
      // Added dark mode text color for better contrast on dark backgrounds
      className={`bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Adjusted grid for potentially better responsiveness */}

          {/* Logo and Description */}
          {/* Changed md:col-span-1 to lg:col-span-1 for consistency */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
              VenturesRoom
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed"> {/* Adjusted text size/leading */}
              Connectez-vous avec des startups innovantes et découvrez les produits et services qui façonnent l'avenir.
            </p>
            <div className="mt-6 flex space-x-4">
              {/* Social Links with Animations */}
              <motion.a
                href="#" // Add actual social links
                aria-label="VenturesRoom on Facebook"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#" // Add actual social links
                aria-label="VenturesRoom on Twitter"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.2, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#" // Add actual social links
                aria-label="VenturesRoom on Instagram"
                className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors" // Adjusted hover color for IG
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#" // Add actual social links
                aria-label="VenturesRoom on LinkedIn"
                className="text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-500 transition-colors" // Adjusted hover color for LI
                whileHover={{ scale: 1.2, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4"> {/* Added margin-bottom */}
              Liens Rapides
            </h3>
            <ul className="space-y-3"> {/* Increased spacing */}
              <li>
                <Link to="/" className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/products"
                  className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Produits
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              {/* Add other relevant links */}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4"> {/* Added margin-bottom */}
              Ressources
            </h3>
            <ul className="space-y-3"> {/* Increased spacing */}
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Guides
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4"> {/* Added margin-bottom */}
               Contactez-Nous
             </h3>
            <ul className="space-y-3"> {/* Increased spacing */}
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                <span className="text-base text-gray-600 dark:text-gray-400">123 Innovation Street, Tech City, 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                 {/* Use tel: link for phone numbers */}
                 <a href="tel:+15551234567" className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">+1 (555) 123-4567</a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                {/* Use mailto: link for emails */}
                <a href="mailto:contact@venturesroom.com" className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">contact@venturesroom.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"> {/* Slightly lighter border in dark mode */}
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-gray-500 dark:text-gray-400 text-sm order-2 md:order-1 mt-4 md:mt-0">
              © {new Date().getFullYear()} VenturesRoom. Tous droits réservés.
            </p>
            <div className="order-1 md:order-2 flex flex-wrap justify-center space-x-4 md:space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Conditions d'utilisation
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Fait avec <Heart className="h-4 w-4 inline text-red-500 mx-1 fill-current" /> par l'équipe VenturesRoom
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer;