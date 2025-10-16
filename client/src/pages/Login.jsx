import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await login({
          username: formData.username,
          password: formData.password
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          setIsLoading(false);
          return;
        }
        result = await signup({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }
      
      if (result.success) {
        navigate('/');
      } else {
        alert(result.error || 'Authentication failed');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign-in logic here
    console.log('Google sign-in clicked');
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Login Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="relative container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md">
            {/* Back to Home Link */}
            <div className="mb-8 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors duration-300 professional-hover"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Login Card */}
            <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 professional-hover scale-in">
              <CardHeader className="text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow-primary mb-4 glow-pulse mx-auto">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold gradient-text uppercase tracking-wide">
                  {isLogin ? 'Welcome Back' : 'Join ResuZo'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isLogin 
                    ? 'Sign in to your account to continue building your professional future'
                    : 'Create your account and start building your dream career'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Login/Signup Toggle */}
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                      isLogin 
                        ? 'bg-primary text-primary-foreground shadow-glow-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                      !isLogin 
                        ? 'bg-primary text-primary-foreground shadow-glow-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-foreground">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-10 bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field (for signup) */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field (for signup) */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  {/* Forgot Password Link (for login) */}
                  {isLogin && (
                    <div className="text-right">
                      <Link 
                        to="#" 
                        className="text-sm text-primary hover:text-primary/80 transition-colors duration-300"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    variant="neural" 
                    size="lg" 
                    className="w-full shadow-glow-primary professional-hover bounce-in"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    <User className="h-4 w-4 ml-2" />
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <Separator className="bg-border" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-4 text-sm text-muted-foreground">
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <Button 
                  type="button"
                  variant="glass" 
                  size="lg" 
                  className="w-full professional-hover scale-in"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* Terms and Privacy (for signup) */}
                {!isLogin && (
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <Link to="#" className="text-primary hover:text-primary/80 transition-colors duration-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="#" className="text-primary hover:text-primary/80 transition-colors duration-300">
                      Privacy Policy
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
                >
                  {isLogin ? 'Sign up here' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
