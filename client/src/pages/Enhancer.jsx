import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Target,
  Zap,
  Download,
  RefreshCw
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Enhancer = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const analysisResults = {
    score: 87,
    improvements: [
      {
        type: 'success',
        title: 'Strong Action Verbs',
        description: 'Great use of impactful action verbs throughout your resume.',
        icon: CheckCircle
      },
      {
        type: 'warning',
        title: 'Missing Keywords',
        description: 'Add 5 more industry-specific keywords to improve ATS compatibility.',
        icon: AlertCircle
      },
      {
        type: 'info',
        title: 'Quantify Achievements',
        description: 'Include more metrics and numbers to showcase your impact.',
        icon: TrendingUp
      }
    ],
    suggestions: [
      {
        section: 'Professional Summary',
        original: 'Experienced software developer with knowledge of various programming languages.',
        improved: 'Results-driven Senior Software Engineer with 5+ years of experience leading cross-functional teams to deliver scalable web applications, increasing user engagement by 40% and reducing system downtime by 60%.',
        impact: 'High'
      },
      {
        section: 'Work Experience',
        original: 'Worked on various projects to improve user experience.',
        improved: 'Led UI/UX optimization initiatives across 3 major products, resulting in 25% increase in user retention and 35% reduction in bounce rate.',
        impact: 'High'
      },
      {
        section: 'Skills',
        original: 'JavaScript, React, Node.js',
        improved: 'JavaScript (ES6+), React.js, Node.js, TypeScript, AWS, Docker, MongoDB, RESTful APIs, Agile/Scrum',
        impact: 'Medium'
      }
    ]
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File uploaded successfully!",
        description: `${file.name} is ready for analysis.`,
      });
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been analyzed and optimized suggestions are ready.",
      });
    }, 3000);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-muted-foreground';
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
              Resume <span className="gradient-text">Enhancer</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your existing resume and get AI-powered suggestions to make it irresistible to employers
            </p>
          </div>

          {!analysisComplete ? (
            <div className="max-w-2xl mx-auto">
              {/* Upload Section */}
              <Card className="glass-card border-white/10 mb-8">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow-primary mx-auto mb-4">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="gradient-text">Upload Your Resume</CardTitle>
                  <CardDescription>
                    Supported formats: PDF, DOC, DOCX (Max 10MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center transition-colors hover:border-white/40">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center space-y-4"
                    >
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your resume will be analyzed securely and privately
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {uploadedFile && (
                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analyze Button */}
              {uploadedFile && (
                <div className="text-center">
                  <Button
                    variant="neural"
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="shadow-glow-primary"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Enhance with AI
                      </>
                    )}
                  </Button>
                  {isAnalyzing && (
                    <p className="text-sm text-muted-foreground mt-4">
                      This may take a few moments while our AI analyzes your resume...
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Analysis Score */}
              <Card className="glass-card border-white/10">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full shadow-glow-primary mx-auto mb-4">
                    <span className={`text-3xl font-bold ${getScoreColor(analysisResults.score)}`}>
                      {analysisResults.score}
                    </span>
                  </div>
                  <CardTitle className="gradient-text text-2xl">Resume Score</CardTitle>
                  <CardDescription>
                    Your resume is performing well! Here's how to make it even better.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Analysis Results */}
                <div className="space-y-6">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-6 w-6 text-primary" />
                        <span>Analysis Results</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysisResults.improvements.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                            <Icon 
                              className={`h-6 w-6 mt-0.5 ${
                                item.type === 'success' ? 'text-green-400' :
                                item.type === 'warning' ? 'text-yellow-400' :
                                'text-blue-400'
                              }`} 
                            />
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Improvement Suggestions */}
                <div className="space-y-6">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-6 w-6 text-secondary" />
                        <span>AI Suggestions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {analysisResults.suggestions.map((suggestion, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{suggestion.section}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${getImpactColor(suggestion.impact)}`}>
                              {suggestion.impact} Impact
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <p className="text-red-300 font-medium mb-1">Before:</p>
                              <p className="text-muted-foreground">{suggestion.original}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <p className="text-green-300 font-medium mb-1">After:</p>
                              <p className="text-foreground">{suggestion.improved}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="neural" size="lg" className="shadow-glow-primary">
                  <Download className="h-5 w-5 mr-2" />
                  Download Enhanced Resume
                </Button>
                <Button variant="cyber" size="lg">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Analyze Another Resume
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

export default Enhancer;