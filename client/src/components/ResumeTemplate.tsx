import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  about?: string;
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
  projects?: Array<{ title: string; description: string; link?: string; technologies?: string }>;
  certifications?: Array<{ name: string; issuer?: string; date?: string }>;
}

interface ResumeTemplateProps {
  data: ResumeData;
}

const ResumeTemplate = forwardRef<HTMLDivElement, ResumeTemplateProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white text-black max-w-[850px] mx-auto opacity-100"
        style={{ fontFamily: 'Arial, sans-serif', color: '#000000', background: '#ffffff', padding: '40px 48px' }}
      >
        <div className="space-y-8">
          <div className="text-center border-b-2 border-gray-800 pb-5">
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
            <div className="leading-relaxed">
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-sm text-gray-800 leading-relaxed">
                {data.personal.summary}
              </p>
            </div>
          )}

          {data.personal.about && (
            <div className="leading-relaxed">
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">ABOUT</h2>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line text-justify">
                {data.personal.about}
              </p>
            </div>
          )}

          {data.experience.length > 0 && data.experience[0].company && (
            <div className="leading-relaxed">
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
                      <p className="text-md font-semibold text-gray-800 mb-1">
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
            <div className="leading-relaxed">
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

          {data.projects && data.projects.some(p => p.title || p.description || p.link || p.technologies) && (
            <div className="leading-relaxed">
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">PROJECTS</h2>
              <div className="space-y-3">
                {data.projects.map((proj, idx) => (
                  proj.title ? (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-semibold text-black">{proj.title}</h3>
                        {proj.technologies && (
                          <span className="text-xs text-gray-700">{proj.technologies}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-line">{proj.description}</p>
                      {proj.link && (
                        <p className="text-xs text-blue-700 break-all">{proj.link}</p>
                      )}
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <div className="leading-relaxed">
              <h2 className="text-xl font-bold text-black mb-3 border-b border-gray-600 pb-1">CERTIFICATIONS</h2>
              <div className="space-y-2">
                {data.certifications.map((cert, idx) => (
                  cert.name ? (
                    <div key={idx} className="flex justify-between text-sm text-gray-800">
                      <span className="font-medium">{cert.name}</span>
                      <span className="text-gray-700">{[cert.issuer, cert.date].filter(Boolean).join(' • ')}</span>
                    </div>
                  ) : null
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
        <div className="pt-6 text-center text-xs text-gray-600">Thank you.</div>
      </div>
    );
  }
);

ResumeTemplate.displayName = 'ResumeTemplate';

export default ResumeTemplate;
