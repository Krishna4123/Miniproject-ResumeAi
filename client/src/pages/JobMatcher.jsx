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
import { matchJob } from '@/services/api';

const JobMatcher = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [jobMatches, setJobMatches] = useState(null);

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
    try {
      // Simulate AI analysis
      const mockResults = await matchJob({ text: uploadedFile });
      setJobMatches(mockResults.data);
      setAnalysisComplete(true);
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been analyzed and job matches are ready.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
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
              Job <span className="gradient-text">Matcher</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your resume and find the best job matches for you.
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
                        Finding Jobs...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Find Jobs
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
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-primary" />
                    <span>Job Matches</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jobMatches && jobMatches.length > 0 ? (
                    jobMatches.map((job, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No job matches found.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobMatcher;
