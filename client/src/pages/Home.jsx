import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Star,
  ArrowRight,
  Users,
  Award,
  BarChart3
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Resume Builder',
      description: 'Create stunning, ATS-optimized resumes with our intelligent builder that understands your industry.',
      color: 'primary'
    },
    {
      icon: Target,
      title: 'Smart Enhancer',
      description: 'Upload your existing resume and get AI-powered suggestions to improve content, format, and keywords.',
      color: 'secondary'
    },
    {
      icon: TrendingUp,
      title: 'Career Roadmap',
      description: 'Get personalized career paths and skill recommendations based on your goals and market trends.',
      color: 'accent'
    }
  ];

  const stats = [
    { icon: Users, value: '50K+', label: 'Happy Users' },
    { icon: Award, value: '95%', label: 'Success Rate' },
    { icon: BarChart3, value: '3x', label: 'More Interviews' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      content: 'Smart Resume AI helped me land my dream job at Google. The AI suggestions were spot-on!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Marketing Director',
      content: 'The career roadmap feature gave me clear direction for my professional growth. Highly recommended!',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Data Scientist',
      content: 'The resume enhancer transformed my old resume into a powerful marketing tool. Amazing results!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto slide-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your Career with{' '}
              <span className="gradient-text">AI-Powered</span> Resumes
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Build, enhance, and optimize your resume with cutting-edge AI technology. 
              Get more interviews, land better jobs, and accelerate your career growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button variant="neural" size="lg" className="shadow-glow-primary" asChild>
                <Link to="/builder">
                  Start Building Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/enhancer">
                  Enhance Existing Resume
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center floating">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-glow-primary mb-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-card relative">
        <div className="absolute inset-0 cyber-grid opacity-5"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful <span className="gradient-text">AI Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, enhance, and optimize your professional presence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group slide-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow-primary group-hover:shadow-glow-secondary transition-all duration-300 mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl gradient-text">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their careers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="glass-card border-white/10 slide-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-foreground italic leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-card relative">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Transform</span> Your Career?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of professionals who've already accelerated their careers with Smart Resume AI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="neural" size="lg" className="shadow-glow-primary" asChild>
                <Link to="/builder">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link to="/roadmap">
                  View Career Paths
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;