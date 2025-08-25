import { Link } from 'react-router-dom';
import { Brain, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'Email', href: 'mailto:contact@smartresumeai.com', icon: Mail },
  ];

  const footerLinks = {
    Product: [
      { name: 'Resume Builder', href: '/builder' },
      { name: 'Resume Enhancer', href: '/enhancer' },
      { name: 'Career Roadmap', href: '/roadmap' },
      { name: 'Pricing', href: '#' },
    ],
    Company: [
      { name: 'About Us', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Support: [
      { name: 'Help Center', href: '#' },
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Status', href: '#' },
    ],
  };

  return (
    <footer className="relative border-t border-white/10 bg-gradient-card">
      {/* Background Pattern */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <div className="p-2 bg-gradient-primary rounded-xl shadow-glow-primary group-hover:shadow-glow-secondary transition-all duration-300">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">
                Smart Resume AI
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              Transform your career with AI-powered resume building, enhancement, and 
              personalized career roadmaps. Join thousands of professionals who've 
              landed their dream jobs.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-primary hover:bg-white/10 hover:shadow-glow-primary transition-all duration-300"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              © {currentYear} Smart Resume AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                to="#" 
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link 
                to="#" 
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>by the Smart Resume AI team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;