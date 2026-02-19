import { ParsedResume } from '@/types/templates'

export function generateModernMinimalLatex(resume: ParsedResume): string {
  const escapeTex = (str: string): string => {
    if (!str) return ''
    return str
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
  }

  const experienceSection = resume.experience.map(exp => `
\\subsection*{${escapeTex(exp.title)}}
\\textbf{${escapeTex(exp.company)}} \\hfill ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}
${exp.location ? `\\\\\\textit{${escapeTex(exp.location)}}` : ''}
\\begin{itemize}[leftmargin=*,nosep]
${exp.bullets.map(b => `  \\item ${escapeTex(b)}`).join('\n')}
\\end{itemize}
`).join('\n')

  const educationSection = resume.education.map(edu => `
\\textbf{${escapeTex(edu.degree)}} \\hfill ${escapeTex(edu.graduationDate)}\\\\
${escapeTex(edu.school)}${edu.location ? `, ${escapeTex(edu.location)}` : ''}
${edu.gpa ? `\\\\GPA: ${escapeTex(edu.gpa)}` : ''}
${edu.honors?.length ? `\\\\${edu.honors.map(h => escapeTex(h)).join(', ')}` : ''}
`).join('\n\\vspace{0.3em}\n')

  const skillsSection = resume.skills.length > 0
    ? resume.skills.map(s => escapeTex(s)).join(' $\\bullet$ ')
    : ''

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

% Colors
\\definecolor{primary}{RGB}{59, 130, 246}
\\definecolor{text}{RGB}{30, 41, 59}

% Remove page numbers
\\pagenumbering{gobble}

% Section formatting
\\usepackage{titlesec}
\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{1em}{0.5em}
\\titleformat{\\subsection}[runin]{\\bfseries}{}{0em}{}

% No paragraph indent
\\setlength{\\parindent}{0pt}

\\begin{document}

% Header
\\begin{center}
{\\LARGE\\bfseries ${escapeTex(resume.fullName)}}\\\\[0.3em]
${[
  resume.email ? `\\href{mailto:${resume.email}}{${escapeTex(resume.email)}}` : '',
  resume.phone ? escapeTex(resume.phone) : '',
  resume.linkedin ? `\\href{${resume.linkedin}}{LinkedIn}` : '',
  resume.location ? escapeTex(resume.location) : ''
].filter(Boolean).join(' $\\bullet$ ')}
\\end{center}

${resume.summary ? `
\\section*{Summary}
${escapeTex(resume.summary)}
` : ''}

\\section*{Experience}
${experienceSection}

\\section*{Education}
${educationSection}

${skillsSection ? `
\\section*{Skills}
${skillsSection}
` : ''}

\\end{document}`
}
