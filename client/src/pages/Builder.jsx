import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Download, 
  Eye, 
  Save, 
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  X
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Builder = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('personal');
  const [isGenerating, setIsGenerating] = useState(false);

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
  ];

  const [formData, setFormData] = useState({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      summary: ''
    },
    experience: [
      {
        company: '',
        position: '',
        duration: '',
        description: ''
      }
    ],
    education: [
      {
        institution: '',
        degree: '',
        duration: '',
        gpa: ''
      }
    ],
    skills: []
  });

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "AI Enhancement Complete!",
        description: "Your resume has been optimized with AI suggestions.",
      });
    }, 2000);
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }]
    }));
  };

const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', duration: '', gpa: '' }]
    }));
  };

const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const renderPersonalSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            placeholder="John Doe"
            value={formData.personal.fullName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personal: { ...prev.personal, fullName: e.target.value }
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john@example.com"
            value={formData.personal.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personal: { ...prev.personal, email: e.target.value }
            }))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            placeholder="+1 (555) 123-4567"
            value={formData.personal.phone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personal: { ...prev.personal, phone: e.target.value }
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="San Francisco, CA"
            value={formData.personal.location}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personal: { ...prev.personal, location: e.target.value }
            }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn Profile</Label>
        <Input 
          id="linkedin" 
          placeholder="https://linkedin.com/in/johndoe"
          value={formData.personal.linkedin}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personal: { ...prev.personal, linkedin: e.target.value }
          }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea 
          id="summary" 
          placeholder="Write a compelling summary of your professional background..."
          rows={4}
          value={formData.personal.summary}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personal: { ...prev.personal, summary: e.target.value }
          }))}
        />
        <Button 
          variant="neural" 
          size="sm" 
          onClick={handleGenerateWithAI}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="space-y-6">
      {formData.experience.map((exp, index) => (
        <Card key={index} className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Experience #{index + 1}</CardTitle>
            {formData.experience.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input placeholder="Google Inc." />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input placeholder="Software Engineer" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input placeholder="Jan 2020 - Present" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe your key responsibilities and achievements..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button 
        variant="outline" 
        onClick={addExperience}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      {formData.education.map((edu, index) => (
        <Card key={index} className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Education #{index + 1}</CardTitle>
            {formData.education.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input placeholder="Stanford University" />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input placeholder="Bachelor of Science in Computer Science" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input placeholder="2016 - 2020" />
              </div>
              <div className="space-y-2">
                <Label>GPA (Optional)</Label>
                <Input placeholder="3.8/4.0" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button 
        variant="outline" 
        onClick={addEducation}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-2">
          {['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'].map((skill, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-gradient-primary text-primary-foreground rounded-full text-sm font-medium shadow-glow-primary"
            >
              {skill}
              <button className="ml-2 text-xs hover:text-destructive">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add a skill..." className="flex-1" />
          <Button variant="neural">Add</Button>
        </div>
      </div>
      
      <Button 
        variant="cyber" 
        onClick={handleGenerateWithAI}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Brain className="h-4 w-4 mr-2 animate-spin" />
            Analyzing Skills...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Suggest Skills with AI
          </>
        )}
      </Button>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection();
      case 'experience':
        return renderExperienceSection();
      case 'education':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      default:
        return renderPersonalSection();
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
              AI Resume <span className="gradient-text">Builder</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create a professional, ATS-optimized resume with our intelligent builder
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="glass-card border-white/10 sticky top-24">
                <CardHeader>
                  <CardTitle className="gradient-text">Build Sections</CardTitle>
                  <CardDescription>Complete each section to build your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                            activeSection === section.id
                              ? 'bg-gradient-primary text-primary-foreground shadow-glow-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{section.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>
                      {sections.find(s => s.id === activeSection)?.label}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Fill in your information and let AI optimize it for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderActiveSection()}
                </CardContent>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-24">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="gradient-text">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[8.5/11] bg-white/5 rounded-lg border border-white/10 p-4 text-xs text-muted-foreground">
                      <div className="space-y-2">
                        <div className="h-3 bg-white/20 rounded"></div>
                        <div className="h-2 bg-white/10 rounded w-3/4"></div>
                        <div className="h-2 bg-white/10 rounded w-1/2"></div>
                        <div className="mt-4 space-y-1">
                          <div className="h-2 bg-white/10 rounded"></div>
                          <div className="h-2 bg-white/10 rounded w-5/6"></div>
                          <div className="h-2 bg-white/10 rounded w-4/6"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Button variant="neural" className="w-full shadow-glow-primary">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Resume
                  </Button>
                  <Button variant="cyber" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="ghost" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Builder;