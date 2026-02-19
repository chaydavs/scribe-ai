import { ParsedResume } from '@/types/templates'

/**
 * Modern Minimal Template
 * Based on research from FAANG recruiters:
 * - Clean, ATS-friendly formatting
 * - Years of experience visible immediately
 * - Scannable in 6 seconds
 * - XYZ formula for bullets
 * - One page preferred
 */
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

  // Format experience with emphasis on impact first (XYZ formula)
  const experienceSection = resume.experience.map(exp => `
\\noindent\\textbf{${escapeTex(exp.title)}} \\hfill \\textbf{${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}}\\\\
\\textit{${escapeTex(exp.company)}}${exp.location ? ` | ${escapeTex(exp.location)}` : ''}
\\begin{itemize}[leftmargin=1.5em,topsep=0.3em,itemsep=0.2em]
${exp.bullets.slice(0, 4).map(b => `  \\item ${escapeTex(b)}`).join('\n')}
\\end{itemize}
\\vspace{0.5em}
`).join('\n')

  const educationSection = resume.education.map(edu => `
\\noindent\\textbf{${escapeTex(edu.degree)}} \\hfill ${escapeTex(edu.graduationDate)}\\\\
\\textit{${escapeTex(edu.school)}}${edu.location ? ` | ${escapeTex(edu.location)}` : ''}
${edu.gpa ? ` | GPA: ${escapeTex(edu.gpa)}` : ''}
`).join('\n\\vspace{0.3em}\n')

  // Group skills for better readability
  const skillsSection = resume.skills.length > 0
    ? resume.skills.map(s => escapeTex(s)).join(', ')
    : ''

  return `\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[top=0.5in,bottom=0.5in,left=0.6in,right=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

% ATS-friendly: minimal styling, standard fonts
\\definecolor{primary}{RGB}{0, 0, 0}
\\definecolor{accent}{RGB}{64, 64, 64}

% Remove page numbers
\\pagenumbering{gobble}

% Section formatting - clean horizontal lines
\\usepackage{titlesec}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\vspace{-0.5em}\\rule{\\linewidth}{0.4pt}]
\\titlespacing{\\section}{0pt}{1em}{0.5em}

% Compact lists
\\setlist[itemize]{leftmargin=1.5em,topsep=0.2em,itemsep=0.15em,parsep=0em}

% No paragraph indent
\\setlength{\\parindent}{0pt}

\\begin{document}

% Header - Name prominently displayed
\\begin{center}
{\\LARGE\\bfseries ${escapeTex(resume.fullName)}}\\\\[0.4em]
{\\small ${[
  resume.email ? `\\href{mailto:${resume.email}}{${escapeTex(resume.email)}}` : '',
  resume.phone ? escapeTex(resume.phone) : '',
  resume.linkedin ? `\\href{${resume.linkedin}}{LinkedIn}` : '',
  resume.location ? escapeTex(resume.location) : ''
].filter(Boolean).join(' | ')}}
\\end{center}

\\vspace{0.3em}

${resume.summary ? `
\\section*{Summary}
${escapeTex(resume.summary)}
` : ''}

\\section*{Experience}
${experienceSection}

\\section*{Education}
${educationSection}

${skillsSection ? `
\\section*{Technical Skills}
${skillsSection}
` : ''}

\\end{document}`
}
