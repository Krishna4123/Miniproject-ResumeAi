import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import ResumeTemplate from './ResumeTemplate';
import { generatePDF } from '../utils/pdfGenerator';
import { useToast } from '../hooks/use-toast';

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
    gpa: string;
  }>;
  skills: string[];
}

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

const ResumePreviewModal = ({ isOpen, onClose, resumeData }: ResumePreviewModalProps) => {
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);

  // Loosen types for JS-based UI components to satisfy TSX usage
  const DialogAny = Dialog as any;
  const DialogContentAny = DialogContent as any;
  const DialogHeaderAny = DialogHeader as any;
  const DialogTitleAny = DialogTitle as any;
  const DialogDescriptionAny = DialogDescription as any;
  const ButtonAny = Button as any;

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) {
      toast({
        title: "Error",
        description: "Resume preview not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = resumeData.personal.fullName
        ? `${resumeData.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';

      // Create an offscreen clone for reliable rendering (avoids modal/backdrop issues)
      const source = resumeRef.current as HTMLElement;
      const clone = source.cloneNode(true) as HTMLElement;
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = `${source.clientWidth || 850}px`;
      wrapper.style.background = '#ffffff';
      wrapper.style.padding = '0';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await generatePDF(wrapper, fileName);

      document.body.removeChild(wrapper);

      toast({
        title: "Success!",
        description: "Your resume has been downloaded as PDF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogAny open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContentAny className="max-w-[95vw] md:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeaderAny>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitleAny className="text-2xl">Resume Preview</DialogTitleAny>
              <DialogDescriptionAny>
                Review your resume before downloading
              </DialogDescriptionAny>
            </div>
            <div className="flex gap-2">
              <ButtonAny onClick={handleDownloadPDF} variant="neural">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </ButtonAny>
              <ButtonAny onClick={onClose} variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </ButtonAny>
            </div>
          </div>
        </DialogHeaderAny>

        <div className="mt-4 border rounded-lg overflow-hidden bg-white">
          <div ref={resumeRef}>
            <ResumeTemplate data={resumeData} />
          </div>
        </div>
      </DialogContentAny>
    </DialogAny>
  );
};

export default ResumePreviewModal;
