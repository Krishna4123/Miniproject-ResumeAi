import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Send,
  User,
  LogIn,
  CheckCircle
} from 'lucide-react';

const FeedbackSection = ({ isLoggedIn, onLoginRequired }) => {
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    usefulFeatures: [],
    dislikedFeatures: [],
    improvements: '',
    additionalComments: '',
    overallExperience: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const features = [
    'AI Resume Builder',
    'Smart Enhancer',
    'Career Roadmap',
    'Job Matcher',
    'Professional Templates',
    'ATS Optimization',
    'Real-time Suggestions',
    'Export Options'
  ];

  const improvementAreas = [
    'User Interface',
    'Feature Functionality',
    'Performance Speed',
    'Mobile Experience',
    'Customer Support',
    'Documentation',
    'Pricing',
    'Integration Options'
  ];

  const handleRatingChange = (rating) => {
    setFeedbackData(prev => ({ ...prev, rating }));
  };

  const handleFeatureToggle = (feature, type) => {
    setFeedbackData(prev => ({
      ...prev,
      [type]: prev[type].includes(feature)
        ? prev[type].filter(f => f !== feature)
        : [...prev[type], feature]
    }));
  };

  const handleInputChange = (field, value) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    
    // Handle feedback submission
    console.log('Feedback submitted:', feedbackData);
    setIsSubmitted(true);
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className="transition-all duration-200 hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= feedbackData.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-muted-foreground hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-3 text-sm text-muted-foreground">
          {feedbackData.rating > 0 ? `${feedbackData.rating}/5` : 'Rate us'}
        </span>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gradient-card relative">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full shadow-glow-primary mb-6 glow-pulse">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Thank You for Your <span className="gradient-text">Feedback!</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Your insights help us improve ResuZo and create better experiences for all our users.
            </p>
            <Button 
              variant="neural" 
              size="lg" 
              className="shadow-glow-primary professional-hover"
              onClick={() => setIsSubmitted(false)}
            >
              Submit Another Feedback
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-card relative">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 fade-in-up">
              Help Us <span className="gradient-text">Improve ResuZo</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto fade-in-up" style={{ animationDelay: '0.2s' }}>
              Your feedback is invaluable in making ResuZo the best resume-building platform
            </p>
          </div>

          {/* Login Prompt */}
          {!isLoggedIn && (
            <Card className="glass-card border-white/10 mb-8 scale-in">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow-primary mb-4 glow-pulse">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Please Sign In to Provide Feedback</h3>
                <p className="text-muted-foreground mb-6">
                  We'd love to hear your thoughts! Please sign in to share your feedback and help us improve.
                </p>
                <Button 
                  variant="neural" 
                  size="lg" 
                  className="shadow-glow-primary professional-hover"
                  asChild
                >
                  <Link to="/login">
                    Sign In to Continue
                    <User className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Feedback Form */}
          {isLoggedIn && (
            <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 professional-hover scale-in">
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-text uppercase tracking-wide text-center">
                  Share Your Experience
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Help us understand what works well and what we can improve
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Overall Rating */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-foreground flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-400" />
                      Overall Rating
                    </Label>
                    <div className="flex justify-center">
                      {renderStars()}
                    </div>
                  </div>

                  {/* Useful Features */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-foreground flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2 text-green-400" />
                      Which features do you find most useful?
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={`useful-${feature}`}
                            checked={feedbackData.usefulFeatures.includes(feature)}
                            onCheckedChange={() => handleFeatureToggle(feature, 'usefulFeatures')}
                          />
                          <Label 
                            htmlFor={`useful-${feature}`}
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disliked Features */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-foreground flex items-center">
                      <ThumbsDown className="h-5 w-5 mr-2 text-red-400" />
                      Which features need improvement?
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={`disliked-${feature}`}
                            checked={feedbackData.dislikedFeatures.includes(feature)}
                            onCheckedChange={() => handleFeatureToggle(feature, 'dislikedFeatures')}
                          />
                          <Label 
                            htmlFor={`disliked-${feature}`}
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-foreground">
                      What areas need the most improvement?
                    </Label>
                    <RadioGroup
                      value={feedbackData.overallExperience}
                      onValueChange={(value) => handleInputChange('overallExperience', value)}
                    >
                      {improvementAreas.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <RadioGroupItem value={area} id={area} />
                          <Label htmlFor={area} className="text-muted-foreground cursor-pointer">
                            {area}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Specific Improvements */}
                  <div className="space-y-4">
                    <Label htmlFor="improvements" className="text-lg font-semibold text-foreground">
                      Specific suggestions for improvement
                    </Label>
                    <Textarea
                      id="improvements"
                      placeholder="Tell us what specific improvements you'd like to see..."
                      value={feedbackData.improvements}
                      onChange={(e) => handleInputChange('improvements', e.target.value)}
                      className="min-h-[120px] bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  {/* Additional Comments */}
                  <div className="space-y-4">
                    <Label htmlFor="comments" className="text-lg font-semibold text-foreground flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                      Additional comments
                    </Label>
                    <Textarea
                      id="comments"
                      placeholder="Any other thoughts, suggestions, or feedback you'd like to share?"
                      value={feedbackData.additionalComments}
                      onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                      className="min-h-[100px] bg-input border-border focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-6">
                    <Button 
                      type="submit" 
                      variant="neural" 
                      size="lg" 
                      className="shadow-glow-primary professional-hover bounce-in"
                    >
                      Submit Feedback
                      <Send className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;

