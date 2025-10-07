import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  duration: string;
  gpa: string;
}

interface ResumeData {
  personal: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

interface ResumeTemplateProps {
  data: ResumeData;
}

const ResumeTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white text-black p-12 max-w-[850px] mx-auto opacity-100"
        style={{ fontFamily: 'Arial, sans-serif', color: '#000000', background: '#ffffff' }}
      >
        <div className="space-y-6">
          <div className="text-center border-b-2 border-gray-800 pb-4">
            <h1 className="text-4xl font-bold text-black mb-3">
              {data.personal.fullName || 'Your Name'}
            </h1>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-800">
              {data.personal.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{data.personal.email}</span>
                </div>
              )}
              {data.personal.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{data.personal.phone}</span>
                </div>
              )}
              {data.personal.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{data.personal.location}</span>
                </div>
              )}
              {data.personal.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="h-4 w-4" />
                  <span className="truncate max-w-[200px]">
                    {data.personal.linkedin.replace('https://', '')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {data.personal.summary && (
            <div>
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-sm text-gray-800 leading-relaxed">
                {data.personal.summary}
              </p>
            </div>
          )}

          {data.experience.length > 0 && data.experience[0].company && (
            <div>
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">
                PROFESSIONAL EXPERIENCE
              </h2>
              <div className="space-y-4">
                {data.experience.map((exp, index) => (
                  exp.company && (
                    <div key={index}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-bold text-black">
                          {exp.position || 'Position Title'}
                        </h3>
                        <span className="text-sm text-gray-700 italic">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-md font-semibold text-gray-800 mb-2">
                        {exp.company}
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && data.education[0].institution && (
            <div>
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">
                EDUCATION
              </h2>
              <div className="space-y-3">
                {data.education.map((edu, index) => (
                  edu.institution && (
                    <div key={index}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-bold text-black">
                          {edu.institution}
                        </h3>
                        <span className="text-sm text-gray-700 italic">
                          {edu.duration}
                        </span>
                      </div>
                      <p className="text-md text-gray-800">
                        {edu.degree}
                      </p>
                      {edu.gpa && (
                        <p className="text-sm text-gray-700">
                          GPA: {edu.gpa}
                        </p>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {data.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ResumeTemplate.displayName = 'ResumeTemplate';

export default ResumeTemplate;
