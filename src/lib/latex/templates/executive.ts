import { ParsedResume } from '@/types/templates'
import { escapeLatex } from '../escape'

/**
 * Executive Template
 * - Navy accent (RGB 25, 25, 75), refined
 * - Name in small caps at 18pt
 * - "Executive Summary" if summary exists
 * - 3 bullets per role (fewer, more impactful)
 * - "Core Competencies" instead of Skills
 * - 5 experience entries (longer careers)
 * - No projects section
 * - Slightly wider margins for readability
 */
export function generateExecutiveLatex(resume: ParsedResume): string {
  const esc = escapeLatex

  const contactParts = [
    resume.email || '',
    resume.phone || '',
    resume.location || '',
    resume.linkedin ? `\\href{${esc(resume.linkedin)}}{LinkedIn}` : '',
  ].filter(Boolean)

  const fmtExp = (exp: typeof resume.experience[0]) => {
    const dates = exp.startDate ? (exp.endDate ? `${esc(exp.startDate)} -- ${esc(exp.endDate)}` : esc(exp.startDate)) : ''
    const header = dates ? `\\textbf{${esc(exp.title)}} \\hfill ${dates}` : `\\textbf{${esc(exp.title)}}`
    const company = [exp.company ? `\\textit{${esc(exp.company)}}` : '', exp.location ? esc(exp.location) : ''].filter(Boolean).join(', ')
    const headerLine = company ? `${header} \\\\\n${company}` : header
    if (exp.bullets.length === 0) return headerLine
    return `${headerLine}
\\begin{itemize}[leftmargin=1.2em, topsep=2pt, parsep=1pt, itemsep=1pt]
${exp.bullets.map(b => `  \\item ${esc(b)}`).join('\n')}
\\end{itemize}`
  }
  const experienceSection = resume.experience.map(fmtExp).join('\n\\vspace{4pt}\n')

  const fmtEdu = (edu: typeof resume.education[0]) => {
    const school = edu.school ? `\\textbf{${esc(edu.school)}}` : ''
    const date = edu.graduationDate ? esc(edu.graduationDate) : ''
    const firstLine = school && date ? `${school} \\hfill ${date}` : school || date
    const details = [edu.degree ? esc(edu.degree) : '', edu.gpa ? `GPA: ${esc(edu.gpa)}` : '', ...(edu.honors || []).map(esc)].filter(Boolean).join(' $|$ ')
    return details ? `${firstLine} \\\\\n${details}` : firstLine
  }
  const educationSection = resume.education.map(fmtEdu).join('\n\\vspace{4pt}\n')

  const competencies = resume.skills.map(esc).join(' $\\cdot$ ')

  const certificationsSection = (resume.certifications || []).map(c => esc(c)).join(' $\\cdot$ ')

  return `\\documentclass[10pt, letterpaper]{article}

\\usepackage[top=0.4cm, bottom=0.4cm, left=1.4cm, right=1.4cm]{geometry}
\\usepackage{titlesec}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[
  pdftitle={${esc(resume.fullName)}'s Resume},
  pdfauthor={${esc(resume.fullName)}},
  colorlinks=true,
  urlcolor=NavyBlue
]{hyperref}
\\usepackage{iftex}

\\ifPDFTeX
  \\input{glyphtounicode}
  \\pdfgentounicode=1
  \\usepackage[T1]{fontenc}
  \\usepackage[utf8]{inputenc}
\\fi

\\usepackage{charter}

\\definecolor{navy}{RGB}{25, 25, 75}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Section headers: small-caps, navy, thin rule
\\titleformat{\\section}{\\color{navy}\\bfseries\\normalsize\\scshape}{}{0pt}{}[\\vspace{1pt}\\titlerule[0.6pt]]
\\titlespacing{\\section}{0pt}{8pt}{5pt}

% Navy bullets
\\renewcommand{\\labelitemi}{\\textcolor{navy}{\\scriptsize$\\bullet$}}

\\begin{document}

\\begin{center}
  {\\fontsize{18pt}{20pt}\\selectfont\\textsc{\\textcolor{navy}{${esc(resume.fullName)}}}}\\\\[0.3em]
  {\\footnotesize ${contactParts.join(' \\quad $|$ \\quad ')}}
\\end{center}

\\vspace{4pt}

${resume.summary ? `\\section{Executive Summary}\n${esc(resume.summary)}\n\n` : ''}\\section{Professional Experience}
${experienceSection}

\\section{Education}
${educationSection}

${competencies ? `\\section{Core Competencies}\n${competencies}` : ''}

${certificationsSection ? `\\section{Certifications}\n${certificationsSection}` : ''}

\\end{document}`
}
