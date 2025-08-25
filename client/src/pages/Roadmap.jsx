import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award, 
  Clock,
  CheckCircle,
  ArrowRight,
  MapPin,
  Zap,
  Brain
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Roadmap = () => {
  const { toast } = useToast();
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);

  const roadmapData = {
    timeline: '6-12 months',
    difficulty: 'Intermediate',
    steps: [
      {
        phase: 'Foundation (Months 1-2)',
        title: 'Strengthen Core Skills',
        description: 'Build a solid foundation in essential technologies and methodologies.',
        skills: ['Advanced JavaScript', 'System Design Basics', 'Database Optimization', 'API Design'],
        resources: [
          { type: 'Course', name: 'Advanced JavaScript Patterns', duration: '4 weeks' },
          { type: 'Book', name: 'Designing Data-Intensive Applications', duration: '6 weeks' },
          { type: 'Project', name: 'Build a REST API with Authentication', duration: '2 weeks' }
        ],
        status: 'upcoming'
      },
      {
        phase: 'Growth (Months 3-4)',
        title: 'Leadership & Architecture',
        description: 'Develop leadership skills and deep architectural understanding.',
        skills: ['Team Leadership', 'System Architecture', 'Code Review', 'Mentoring'],
        resources: [
          { type: 'Course', name: 'Tech Leadership Fundamentals', duration: '3 weeks' },
          { type: 'Practice', name: 'Lead a small team project', duration: '4 weeks' },
          { type: 'Certification', name: 'AWS Solutions Architect', duration: '6 weeks' }
        ],
        status: 'current'
      },
      {
        phase: 'Specialization (Months 5-6)',
        title: 'Domain Expertise',
        description: 'Deepen expertise in your chosen specialization area.',
        skills: ['Microservices', 'DevOps', 'Performance Optimization', 'Security'],
        resources: [
          { type: 'Project', name: 'Microservices Architecture Implementation', duration: '6 weeks' },
          { type: 'Course', name: 'Advanced DevOps Practices', duration: '4 weeks' },
          { type: 'Mentorship', name: '1:1 with Senior Architect', duration: '8 weeks' }
        ],
        status: 'upcoming'
      }
    ],
    marketInsights: {
      demand: 'High',
      averageSalary: '$145,000 - $180,000',
      topCompanies: ['Google', 'Amazon', 'Microsoft', 'Netflix', 'Uber'],
      keySkills: ['System Design', 'Leadership', 'Cloud Architecture', 'DevOps']
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!currentRole || !targetRole || !experience) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate your roadmap.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      setRoadmapGenerated(true);
      toast({
        title: "Roadmap Generated!",
        description: "Your personalized career roadmap is ready.",
      });
    }, 3000);
  };

const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'current':
        return <Target className="h-6 w-6 text-yellow-400" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

const getResourceIcon = (type) => {
    switch (type) {
      case 'Course':
        return <BookOpen className="h-4 w-4 text-blue-400" />;
      case 'Project':
        return <Zap className="h-4 w-4 text-purple-400" />;
      case 'Certification':
        return <Award className="h-4 w-4 text-yellow-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Career <span className="gradient-text">Roadmap</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get a personalized AI-generated roadmap to advance your career and reach your goals
            </p>
          </div>

          {!roadmapGenerated ? (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-white/10">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow-primary mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="gradient-text">Build Your Roadmap</CardTitle>
                  <CardDescription>
                    Tell us about your current situation and career goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-role">Current Role</Label>
                    <Input
                      id="current-role"
                      placeholder="e.g., Software Engineer"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target Role</Label>
                    <Input
                      id="target-role"
                      placeholder="e.g., Senior Software Engineer, Technical Lead"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="neural"
                    size="lg"
                    onClick={handleGenerateRoadmap}
                    disabled={isGenerating}
                    className="w-full shadow-glow-primary"
                  >
                    {isGenerating ? (
                      <>
                        <Brain className="h-5 w-5 mr-2 animate-spin" />
                        Generating Roadmap...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Generate My Roadmap
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Roadmap Overview */}
              <Card className="glass-card border-white/10">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl gradient-text">
                    From {currentRole} to {targetRole}
                  </CardTitle>
                  <CardDescription>
                    Your personalized career advancement plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-glow-primary mb-3">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold gradient-text">{roadmapData.timeline}</div>
                      <div className="text-sm text-muted-foreground">Estimated Timeline</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl shadow-glow-secondary mb-3">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold gradient-text">{roadmapData.difficulty}</div>
                      <div className="text-sm text-muted-foreground">Difficulty Level</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-glow-primary mb-3">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold gradient-text">{roadmapData.steps.length}</div>
                      <div className="text-sm text-muted-foreground">Learning Phases</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Steps */}
              <div className="space-y-6">
                {roadmapData.steps.map((step, index) => (
                  <Card key={index} className="glass-card border-white/10">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(step.status)}
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{step.phase}</span>
                          </CardTitle>
                          <CardDescription className="text-lg font-medium text-foreground">
                            {step.title}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">{step.description}</p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skills to Develop */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span>Skills to Develop</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {step.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-3 py-1 bg-gradient-primary text-primary-foreground rounded-full text-sm font-medium shadow-glow-primary"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Learning Resources */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-secondary" />
                            <span>Learning Resources</span>
                          </h4>
                          <div className="space-y-2">
                            {step.resources.map((resource, resourceIndex) => (
                              <div
                                key={resourceIndex}
                                className="flex items-center space-x-3 p-2 rounded-lg bg-white/5"
                              >
                                {getResourceIcon(resource.type)}
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{resource.name}</div>
                                  <div className="text-xs text-muted-foreground">{resource.duration}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Market Insights */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-accent" />
                    <span>Market Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Current market trends for {targetRole}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Market Demand</h4>
                      <p className="text-2xl font-bold">{roadmapData.marketInsights.demand}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Average Salary</h4>
                      <p className="text-lg font-medium">{roadmapData.marketInsights.averageSalary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Top Companies</h4>
                      <div className="space-y-1">
                        {roadmapData.marketInsights.topCompanies.slice(0, 3).map((company, index) => (
                          <div key={index} className="text-sm text-muted-foreground">{company}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Key Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {roadmapData.marketInsights.keySkills.slice(0, 2).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="neural" size="lg" className="shadow-glow-primary">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Start Learning Path
                </Button>
                <Button variant="cyber" size="lg">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Generate New Roadmap
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Roadmap;