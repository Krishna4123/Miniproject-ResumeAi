import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import ResumePreviewModal from '../components/ResumePreviewModal';
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
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../hooks/use-toast';
import { createResume, enhanceResume, getUserResumes, analyzeResume } from '../services/api';

const Builder = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSkill, setNewSkill] = useState('');

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
    try {
      const firstExp = formData.experience?.[0] || {};
      const baseText = [
        formData.personal.fullName,
        formData.personal.summary,
        firstExp.position,
        firstExp.description,
        formData.skills?.join(', ')
      ].filter(Boolean).join(' | ');

      // 1) Try enhancer endpoint
      try {
        const { data } = await enhanceResume(baseText || 'Professional summary generation');
        if (data?.enhancedText) {
          setFormData(prev => {
            const updated = { ...prev, personal: { ...prev.personal, summary: data.enhancedText } };
            // Auto-save
            (async () => { try { await createResume({ content: updated }); } catch {} })();
            return updated;
          });
          toast({ title: 'AI Enhanced', description: 'Summary updated and draft auto-saved.' });
          return;
        }
      } catch (err) {
        // Continue to fallback
        console.error('Enhancer error:', err?.response?.data || err?.message);
      }

      // 2) Fallback: use analyze endpoint if available
      try {
        const { data } = await analyzeResume(baseText || 'Professional summary generation');
        const enhanced = data?.analysis?.enhancedText || data?.message || 'Experienced professional seeking opportunities.';
        setFormData(prev => {
          const updated = { ...prev, personal: { ...prev.personal, summary: enhanced } };
          (async () => { try { await createResume({ content: updated }); } catch {} })();
          return updated;
        });
        toast({ title: 'AI Enhanced (fallback)', description: 'Summary updated using analyzer.' });
        return;
      } catch (err2) {
        console.error('Analyzer error:', err2?.response?.data || err2?.message);
      }

      // 3) Final local heuristic fallback
      const synthesized = `Experienced ${firstExp.position || 'professional'} with strengths in ${(formData.skills || []).slice(0,5).join(', ')}`;
      setFormData(prev => ({ ...prev, personal: { ...prev.personal, summary: synthesized } }));
      toast({ title: 'Local enhancement applied', description: 'Basic summary generated locally.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'AI error', description: 'Could not enhance right now.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
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

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkill('');
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const saveDraft = async () => {
    try {
      const payload = { ...formData };
      await createResume({ content: payload });
      toast({ title: 'Draft saved', description: 'Your resume draft is saved.' });
    } catch (e) {
      toast({ title: 'Save failed', description: 'Could not save draft.', variant: 'destructive' });
    }
  };

  const loadLatestDraft = async () => {
    try {
      // Using mocked auth user id header value "123" also as path param
      const { data } = await getUserResumes('123');
      if (!data || data.length === 0) {
        toast({ title: 'No drafts', description: 'No saved drafts found.' });
        return;
      }
      // Prefer newest by createdAt if present
      const sorted = [...data].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      const latest = sorted[sorted.length - 1];
      if (latest && latest.content) {
        const content = typeof latest.content === 'string' ? (() => { try { return JSON.parse(latest.content); } catch { return null; } })() : latest.content;
        if (!content) {
          toast({ title: 'Invalid draft', description: 'Draft content could not be parsed.', variant: 'destructive' });
          return;
        }
        setFormData(content);
        toast({ title: 'Draft loaded', description: 'Latest draft applied to the form.' });
      } else {
        toast({ title: 'Invalid draft', description: 'Draft content missing.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Load failed', description: 'Could not load drafts.', variant: 'destructive' });
    }
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
                <Input
                  placeholder="Google Inc."
                  value={exp.company}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => {
                      const next = [...prev.experience];
                      next[index] = { ...next[index], company: value };
                      return { ...prev, experience: next };
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  placeholder="Software Engineer"
                  value={exp.position}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => {
                      const next = [...prev.experience];
                      next[index] = { ...next[index], position: value };
                      return { ...prev, experience: next };
                    });
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                placeholder="Jan 2020 - Present"
                value={exp.duration}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => {
                    const next = [...prev.experience];
                    next[index] = { ...next[index], duration: value };
                    return { ...prev, experience: next };
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your key responsibilities and achievements..."
                rows={3}
                value={exp.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => {
                    const next = [...prev.experience];
                    next[index] = { ...next[index], description: value };
                    return { ...prev, experience: next };
                  });
                }}
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
                <Input
                  placeholder="Stanford University"
                  value={edu.institution}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => {
                      const next = [...prev.education];
                      next[index] = { ...next[index], institution: value };
                      return { ...prev, education: next };
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input
                  placeholder="Bachelor of Science in Computer Science"
                  value={edu.degree}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => {
                      const next = [...prev.education];
                      next[index] = { ...next[index], degree: value };
                      return { ...prev, education: next };
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  placeholder="2016 - 2020"
                  value={edu.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => {
                      const next = [...prev.education];
                      next[index] = { ...next[index], duration: value };
                      return { ...prev, education: next };
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>GPA (Optional)</Label>
                <Input
                  placeholder="3.8/4.0"
                  value={edu.gpa}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => {
                      const next = [...prev.education];
                      next[index] = { ...next[index], gpa: value };
                      return { ...prev, education: next };
                    });
                  }}
                />
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
          {formData.skills.map((skill, index) => (
            <div
              key={`${skill}-${index}`}
              className="px-3 py-1 bg-gradient-primary text-primary-foreground rounded-full text-sm font-medium shadow-glow-primary"
            >
              {skill}
              <button className="ml-2 text-xs hover:text-destructive" onClick={() => removeSkill(index)}>×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add a skill..." className="flex-1" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
          <Button variant="neural" onClick={addSkill}>Add</Button>
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
                  <Button variant="neural" className="w-full shadow-glow-primary" onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                     Preview Resume
                  </Button>
                  <Button variant="cyber" className="w-full" onClick={() => setShowPreview(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={saveDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button variant="outline" className="w-full" onClick={loadLatestDraft}>
                    Load Latest Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ResumePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        resumeData={formData}
      />
    </div>
  );
};
export default Builder;