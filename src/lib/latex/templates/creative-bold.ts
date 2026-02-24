import { ParsedResume } from '@/types/templates'

/**
 * Creative Bold Template
 * - Teal accent color for name, section headers, bullets
 * - Bold name at 22pt with teal color
 * - Section headers with colored thick rule
 * - Skills as bold inline tags separated by dots
 * - Eye-catching design for creative roles
 */
export function generateCreativeBoldLatex(resume: ParsedResume): string {
  const esc = (str: string): string => {
    if (!str) return ''
    return str
      .replace(/\\/g, '\x00BACKSLASH\x00')
      .replace(/[&%$#_{}]/g, m => '\\' + m)
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/\|/g, '\\textbar{}')
      .replace(/\x00BACKSLASH\x00/g, '\\textbackslash{}')
  }

  const contactParts = [
    resume.email || '',
    resume.phone || '',
    resume.location || '',
    resume.linkedin ? `\\href{${esc(resume.linkedin)}}{LinkedIn}` : '',
  ].filter(Boolean)

  const fmtExp = (exp: typeof resume.experience[0]) => {
    const dates = exp.startDate ? (exp.endDate ? `${esc(exp.startDate)} -- ${esc(exp.endDate)}` : esc(exp.startDate)) : ''
    const header = dates ? `\\textbf{${esc(exp.title)}} \\hfill \\textit{${dates}}` : `\\textbf{${esc(exp.title)}}`
    const company = [exp.company ? `\\textit{${esc(exp.company)}}` : '', exp.location ? esc(exp.location) : ''].filter(Boolean).join(' $|$ ')
    const headerLine = company ? `${header} \\\\\n${company}` : header
    if (exp.bullets.length === 0) return headerLine
    return `${headerLine}
\\begin{itemize}[leftmargin=1.2em, topsep=2pt, parsep=1pt, itemsep=1pt]
${exp.bullets.map(b => `  \\item ${esc(b)}`).join('\n')}
\\end{itemize}`
  }
  const experienceSection = resume.experience.map(fmtExp).join('\n\\vspace{5pt}\n')

  const fmtEdu = (edu: typeof resume.education[0]) => {
    const school = edu.school ? `\\textbf{${esc(edu.school)}}` : ''
    const date = edu.graduationDate ? esc(edu.graduationDate) : ''
    const firstLine = school && date ? `${school} \\hfill ${date}` : school || date
    const details = [edu.degree ? esc(edu.degree) : '', edu.gpa ? `GPA: ${esc(edu.gpa)}` : '', ...(edu.honors || []).map(esc)].filter(Boolean).join(' $|$ ')
    return details ? `${firstLine} \\\\\n${details}` : firstLine
  }
  const educationSection = resume.education.map(fmtEdu).join('\n\\vspace{4pt}\n')

  const skillsTags = resume.skills.map(s => `\\textbf{${esc(s)}}`).join(' $\\cdot$ ')

  const projectsSection = (resume.projects || []).map(p =>
    `\\textbf{${esc(p.name)}}${p.description ? ` --- ${esc(p.description)}` : ''}${p.technologies?.length ? ` $|$ \\textit{${p.technologies.map(esc).join(', ')}}` : ''}`
  ).join('\n\\vspace{4pt}\n')

  const certificationsSection = (resume.certifications || []).map(c => esc(c)).join(' $\\cdot$ ')

  return `\\documentclass[10pt, letterpaper]{article}

\\usepackage[top=0.5cm, bottom=0.5cm, left=1.2cm, right=1.2cm]{geometry}
\\usepackage{titlesec}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[
  pdftitle={${esc(resume.fullName)}'s Resume},
  pdfauthor={${esc(resume.fullName)}},
  colorlinks=true,
  urlcolor=teal
]{hyperref}
\\usepackage{iftex}

\\ifPDFTeX
  \\input{glyphtounicode}
  \\pdfgentounicode=1
  \\usepackage[T1]{fontenc}
  \\usepackage[utf8]{inputenc}
\\fi

\\usepackage{charter}

\\definecolor{accent}{RGB}{0, 128, 128}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Section headers: bold, colored, with thick colored rule below
\\titleformat{\\section}{\\color{accent}\\bfseries\\normalsize}{}{0pt}{}[\\vspace{-0.3em}{\\color{accent}\\titlerule[1.5pt]}]
\\titlespacing{\\section}{0pt}{10pt}{6pt}

% Colored bullets
\\renewcommand{\\labelitemi}{\\textcolor{accent}{\\scriptsize$\\bullet$}}

\\begin{document}

\\begin{center}
  {\\fontsize{22pt}{24pt}\\selectfont\\textbf{\\textcolor{accent}{${esc(resume.fullName)}}}}

  \\vspace{4pt}

  {\\footnotesize ${contactParts.join(' $|$ ')}}
\\end{center}

\\vspace{4pt}

${resume.summary ? `\\section{Summary}\n${esc(resume.summary)}\n\n` : ''}\\section{Experience}
${experienceSection}

\\section{Education}
${educationSection}

\\section{Skills}
${skillsTags}

${projectsSection ? `\\section{Projects}\n${projectsSection}` : ''}

${certificationsSection ? `\\section{Certifications}\n${certificationsSection}` : ''}

\\end{document}`
}
