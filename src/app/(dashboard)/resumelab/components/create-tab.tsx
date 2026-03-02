'use client'

interface CreateTabProps {
  formData: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin: string
    summary: string
    experience: Array<{ title: string; company: string; location: string; startDate: string; endDate: string; bullets: string[] }>
    education: Array<{ school: string; degree: string; graduationDate: string; gpa: string }>
    skills: string[]
    projects: Array<{ name: string; description: string; technologies: string[] }>
  }
  creatingPdf?: boolean
  userCredits: number
  onUpdateFormField: (field: string, value: string | string[]) => void
  onAddExperience: () => void
  onUpdateExperience: (index: number, field: string, value: string | string[]) => void
  onRemoveExperience: (index: number) => void
  onAddEducation: () => void
  onUpdateEducation: (index: number, field: string, value: string) => void
  onRemoveEducation: (index: number) => void
  onCreateResume: () => void
}

export function CreateTab({
  formData,
  userCredits,
  onUpdateFormField,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onCreateResume,
}: CreateTabProps) {
  return (
    <div className="animate-tab-enter bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => onUpdateFormField('fullName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => onUpdateFormField('email', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => onUpdateFormField('phone', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <input
                  type="text"
                  placeholder="Location (City, State)"
                  value={formData.location}
                  onChange={(e) => onUpdateFormField('location', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={formData.linkedin}
                  onChange={(e) => onUpdateFormField('linkedin', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 md:col-span-2"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Professional Summary</h2>
              <textarea
                placeholder="Brief professional summary..."
                value={formData.summary}
                onChange={(e) => onUpdateFormField('summary', e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-h-[100px] resize-y"
              />
            </div>

            {/* Experience */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Experience</h2>
                <button
                  onClick={onAddExperience}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  + Add Experience
                </button>
              </div>
              {formData.experience.map((exp, index) => (
                <div key={index} className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-slate-500">Position {index + 1}</span>
                    {formData.experience.length > 1 && (
                      <button
                        onClick={() => onRemoveExperience(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => onUpdateExperience(index, 'title', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => onUpdateExperience(index, 'company', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => onUpdateExperience(index, 'location', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => onUpdateExperience(index, 'startDate', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => onUpdateExperience(index, 'endDate', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm text-slate-500 mb-2 block">Key achievements (one per line)</label>
                    <textarea
                      placeholder="• Led team of 5 engineers...&#10;• Increased revenue by 20%..."
                      value={exp.bullets.join('\n')}
                      onChange={(e) => onUpdateExperience(index, 'bullets', e.target.value.split('\n'))}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none min-h-[80px] resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Education</h2>
                <button
                  onClick={onAddEducation}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  + Add Education
                </button>
              </div>
              {formData.education.map((edu, index) => (
                <div key={index} className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-slate-500">Education {index + 1}</span>
                    {formData.education.length > 1 && (
                      <button
                        onClick={() => onRemoveEducation(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="School/University"
                      value={edu.school}
                      onChange={(e) => onUpdateEducation(index, 'school', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => onUpdateEducation(index, 'degree', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Date"
                      value={edu.graduationDate}
                      onChange={(e) => onUpdateEducation(index, 'graduationDate', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="GPA (optional)"
                      value={edu.gpa}
                      onChange={(e) => onUpdateEducation(index, 'gpa', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills</h2>
              <textarea
                placeholder="JavaScript, React, Node.js, Python, SQL..."
                value={formData.skills.join(', ')}
                onChange={(e) => onUpdateFormField('skills', e.target.value.split(',').map(s => s.trim()))}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-h-[60px] resize-y"
              />
              <p className="text-xs text-slate-400 mt-1">Separate skills with commas</p>
            </div>
          </div>

          {/* Export Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Export</h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Classic Professional</p>
                    <p className="text-xs text-slate-500">Clean, ATS-friendly format</p>
                  </div>
                </div>
              </div>

              {/* Preview & Edit Button */}
              <button
                onClick={onCreateResume}
                disabled={!formData.fullName.trim()}
                className="w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white shadow-none transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview & Edit
              </button>
              <p className="text-center text-sm text-slate-500 mt-2">
                Edit, choose a template, then export
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
