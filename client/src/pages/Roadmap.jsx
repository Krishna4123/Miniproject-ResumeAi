import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Brain,
  X,
  Plus,
  Save,
  PlayCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { generateRoadmap, saveRoadmap } from '@/services/api';

const Roadmap = () => {
  const { toast } = useToast();
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experience, setExperience] = useState('');
  const [currentSkills, setCurrentSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillsDetail, setSkillsDetail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [error, setError] = useState('');
  const [roadmapDataState, setRoadmapDataState] = useState(null);

  const handleGenerateRoadmap = async () => {
    if (!currentRole || !targetRole || !experience || currentSkills.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields including at least one current skill.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const roadmapPayload = {
        currentRole,
        targetRole,
        experience,
        currentSkills,
        skillsDetail
      };
      
      const response = await generateRoadmap(roadmapPayload);
      setRoadmapDataState(response.data.roadmap);
      setIsGenerating(false);
      setRoadmapGenerated(true);
      toast({
        title: "Roadmap Generated!",
        description: "Your personalized career roadmap is ready.",
      });
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
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

  const addSkill = () => {
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setCurrentSkills([...currentSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSaveRoadmap = async () => {
    try {
      const roadmapPayload = {
        currentRole,
        targetRole,
        experience,
        currentSkills,
        skillsDetail,
        roadmap: roadmapDataState
      };
      
      await saveRoadmap(roadmapPayload);
      toast({
        title: "Roadmap Saved!",
        description: "Your roadmap has been saved. You can continue learning anytime.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error.response?.data?.message || "Failed to save roadmap. Please try again.",
        variant: "destructive",
      });
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

                  <div className="space-y-2">
                    <Label htmlFor="current-skills">Current Skills</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          id="skill-input"
                          placeholder="e.g., JavaScript, React, Node.js"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={handleSkillKeyPress}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSkill}
                          disabled={!skillInput.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {currentSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentSkills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-1 hover:bg-red-500/20 rounded-full p-0.5"
                                aria-label={`Remove ${skill}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills-detail">Additional Skills Details (Optional)</Label>
                    <Textarea
                      id="skills-detail"
                      placeholder="Describe your proficiency levels or specific expertise in more detail..."
                      value={skillsDetail}
                      onChange={(e) => setSkillsDetail(e.target.value)}
                      rows={3}
                    />
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
                      <div className="text-2xl font-bold gradient-text">{roadmapDataState?.timeline}</div>
                      <div className="text-sm text-muted-foreground">Estimated Timeline</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl shadow-glow-secondary mb-3">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold gradient-text">{roadmapDataState?.difficulty}</div>
                      <div className="text-sm text-muted-foreground">Difficulty Level</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-glow-primary mb-3">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold gradient-text">{roadmapDataState?.steps?.length}</div>
                      <div className="text-sm text-muted-foreground">Learning Phases</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Steps */}
              <div className="space-y-6">
                {roadmapDataState?.steps?.map((step, index) => (
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
                      <p className="text-2xl font-bold">{roadmapDataState?.marketInsights?.demand}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Average Salary</h4>
                      <p className="text-lg font-medium">{roadmapDataState?.marketInsights?.averageSalary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Top Companies</h4>
                      <div className="space-y-1">
                        {roadmapDataState?.marketInsights?.topCompanies?.slice(0, 3).map((company, index) => (
                          <div key={index} className="text-sm text-muted-foreground">{company}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Key Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {roadmapDataState?.marketInsights?.keySkills?.slice(0, 2).map((skill, index) => (
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
                <Button 
                  onClick={handleSaveRoadmap}
                  variant="neural" 
                  size="lg" 
                  className="shadow-glow-primary"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save & Continue Learning
                </Button>
                <Button 
                  onClick={() => setRoadmapGenerated(false)}
                  variant="cyber" 
                  size="lg"
                >
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