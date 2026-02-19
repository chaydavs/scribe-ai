import { ParsedResume } from '@/types/templates'

export function generateClassicProfessionalLatex(resume: ParsedResume): string {
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
\\textbf{${escapeTex(exp.title)}} \\hfill \\textit{${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}}\\\\
\\textit{${escapeTex(exp.company)}}${exp.location ? `, ${escapeTex(exp.location)}` : ''}
\\begin{itemize}[leftmargin=1.5em,topsep=0.3em,itemsep=0.1em]
${exp.bullets.map(b => `  \\item ${escapeTex(b)}`).join('\n')}
\\end{itemize}
\\vspace{0.5em}
`).join('\n')

  const educationSection = resume.education.map(edu => `
\\textbf{${escapeTex(edu.school)}} \\hfill ${escapeTex(edu.graduationDate)}\\\\
\\textit{${escapeTex(edu.degree)}}${edu.gpa ? ` -- GPA: ${escapeTex(edu.gpa)}` : ''}
${edu.honors?.length ? `\\\\${edu.honors.map(h => escapeTex(h)).join(', ')}` : ''}
`).join('\n\\vspace{0.3em}\n')

  return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{times}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

% Remove page numbers
\\pagenumbering{gobble}

% Section formatting
\\usepackage{titlesec}
\\titleformat{\\section}{\\large\\bfseries\\scshape}{}{0em}{}[\\vspace{-0.5em}\\rule{\\linewidth}{0.5pt}]
\\titlespacing{\\section}{0pt}{1.5em}{0.75em}

% No paragraph indent
\\setlength{\\parindent}{0pt}

\\begin{document}

% Header
\\begin{center}
{\\Large\\bfseries\\scshape ${escapeTex(resume.fullName)}}\\\\[0.5em]
${[
  resume.location ? escapeTex(resume.location) : '',
  resume.phone ? escapeTex(resume.phone) : '',
  resume.email ? `\\href{mailto:${resume.email}}{${escapeTex(resume.email)}}` : '',
  resume.linkedin ? `\\href{${resume.linkedin}}{LinkedIn}` : ''
].filter(Boolean).join(' | ')}
\\end{center}

${resume.summary ? `
\\section*{Professional Summary}
${escapeTex(resume.summary)}
` : ''}

\\section*{Professional Experience}
${experienceSection}

\\section*{Education}
${educationSection}

${resume.skills.length > 0 ? `
\\section*{Skills \\& Expertise}
${resume.skills.map(s => escapeTex(s)).join(', ')}
` : ''}

${resume.certifications?.length ? `
\\section*{Certifications}
${resume.certifications.map(c => escapeTex(c)).join(', ')}
` : ''}

\\end{document}`
}
