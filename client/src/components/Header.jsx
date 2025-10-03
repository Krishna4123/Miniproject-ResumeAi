import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap, Target, TrendingUp, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'HOME', href: '/', icon: Target },
    { name: 'BUILDER', href: '/builder', icon: Zap },
    { name: 'ENHANCER', href: '/enhancer', icon: Target },
    { name: 'ROADMAP', href: '/roadmap', icon: TrendingUp },
    { name: 'JOB MATCHER', href: '/job-matcher', icon: Briefcase },
  ];

  const isActiveRoute = (href) => location.pathname === href;


  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => {
              // Scroll to top when clicking logo
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow-primary group-hover:shadow-glow-secondary transition-all duration-300">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text logo-text">
              ResuZo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 navigation-menu">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 professional-hover nav-item",
                    isActiveRoute(item.href) 
                      ? "bg-white/10 text-primary shadow-glow-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Button & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="neural" size="lg" className="shadow-glow-primary professional-hover">
              GET STARTED
              <Zap className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 slide-in">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 professional-hover",
                      isActiveRoute(item.href)
                        ? "bg-white/10 text-primary shadow-glow-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 space-y-3">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <Button variant="neural" className="w-full professional-hover">
                  GET STARTED
                  <Zap className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;