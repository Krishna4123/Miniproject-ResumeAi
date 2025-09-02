// client/src/pages/JobMatcher.jsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  Brain,
  CheckCircle,
  Target,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { matchJob } from "@/services/api";

const JobMatcher = () => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [matchesByRole, setMatchesByRole] = useState({});
  const [predictedRoles, setPredictedRoles] = useState([]);

  // Handle file upload
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

  // Analyze resume and fetch job matches
  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", uploadedFile);

      console.log("Uploading file:", uploadedFile.name, "Size:", uploadedFile.size);

      const { data } = await matchJob(formData);

      console.log("JobMatcher API response data:", data);

      setPredictedRoles(data.predictedRoles || []);
      setMatchesByRole(data.matchesByRole || {});

      setAnalysisComplete(true);

      const totalJobs = Object.values(data.matchesByRole || {}).reduce(
        (sum, jobs) => sum + jobs.length,
        0
      );

      toast({
        title: "Analysis Complete!",
        description: `Found ${totalJobs} job matches across ${(data.predictedRoles || []).length} predicted roles.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      
      let errorMessage = "Could not analyze your resume. Please try again.";
      let errorDescription = "";

      if (error.response?.data) {
        errorMessage = error.response.data.error || errorMessage;
        errorDescription = error.response.data.details || "";
      } else if (error.message) {
        errorDescription = error.message;
      }

      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive",
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
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Job <span className="gradient-text">Matcher</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your resume and find the best job matches for you.
            </p>
          </div>

          {/* Upload + Analysis */}
          {!analysisComplete ? (
            <div className="max-w-2xl mx-auto">
              {/* Upload Section */}
              <Card className="glass-card border-white/10 mb-8">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow-primary mx-auto mb-4">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="gradient-text">
                    Upload Your Resume
                  </CardTitle>
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
                      This may take a few moments while our AI analyzes your
                      resume...
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Job Matches Result */
            <div className="space-y-8">
              {/* Analysis Summary */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <span>Analysis Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h3 className="font-semibold text-primary mb-2">Predicted Roles</h3>
                      {predictedRoles.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {predictedRoles.map((role) => (
                            <li key={role} className="capitalize">{role}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No roles predicted.</p>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h3 className="font-semibold text-primary mb-2">Total Job Matches</h3>
                      <p className="text-lg">
                        {Object.values(matchesByRole).reduce(
                          (sum, jobs) => sum + jobs.length,
                          0
                        )}{" "}
                        positions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs per role */}
              {predictedRoles.length > 0 ? (
                predictedRoles.map((role) => (
                  <Card key={role} className="glass-card border-white/10 mb-8">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-6 w-6 text-primary" />
                        <span className="capitalize">{role} Jobs</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {matchesByRole[role] && matchesByRole[role].length > 0 ? (
                        matchesByRole[role].map((job, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg bg-white/5 border border-white/10 shadow-md"
                          >
                            <h4 className="text-lg font-semibold">{job.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.hiring_organization_name} • {job.city},{" "}
                              {job.country}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Employment: {job.employment_type}
                            </p>
                            <p className="text-sm mb-3 line-clamp-4">{job.description}</p>
                            <p className="text-xs text-muted-foreground mb-4">
                              Source: {job.website}
                            </p>

                            <Button
                              variant="neural"
                              size="sm"
                              onClick={() => window.open(job.url, "_blank")}
                            >
                              View Job
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p>No job matches found for {role}.</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No predicted roles to display jobs for.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobMatcher;
