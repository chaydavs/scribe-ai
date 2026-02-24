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
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, m => '\\' + m)
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/\|/g, '\\textbar{}')
  }

  const contactParts = [
    resume.email || '',
    resume.phone || '',
    resume.location || '',
    resume.linkedin ? 'LinkedIn' : '',
  ].filter(Boolean).map(esc)

  const experienceSection = resume.experience.slice(0, 4).map(exp =>
    `\\textbf{${esc(exp.title)}} \\hfill \\textit{${esc(exp.startDate)} -- ${esc(exp.endDate)}} \\\\
\\textit{${esc(exp.company)}}${exp.location ? ` $|$ ${esc(exp.location)}` : ''}
\\begin{itemize}[leftmargin=1.2em, topsep=2pt, parsep=1pt, itemsep=1pt]
${exp.bullets.slice(0, 4).map(b => `  \\item ${esc(b)}`).join('\n')}
\\end{itemize}`
  ).join('\n\\vspace{5pt}\n')

  const educationSection = resume.education.slice(0, 2).map(edu =>
    `\\textbf{${esc(edu.school)}} \\hfill ${esc(edu.graduationDate)} \\\\
${esc(edu.degree)}${edu.gpa ? ` $|$ GPA: ${esc(edu.gpa)}` : ''}`
  ).join('\n\\vspace{4pt}\n')

  const skillsTags = resume.skills.slice(0, 15).map(s => `\\textbf{${esc(s)}}`).join(' $\\cdot$ ')

  const projectsSection = (resume.projects || []).slice(0, 2).map(p =>
    `\\textbf{${esc(p.name)}} --- ${esc(p.description).slice(0, 150)}${p.technologies?.length ? ` $|$ \\textit{${p.technologies.slice(0, 5).map(esc).join(', ')}}` : ''}`
  ).join('\n\\vspace{3pt}\n')

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

${resume.summary ? `\\section{Summary}\n${esc(resume.summary.slice(0, 300))}\n\n` : ''}\\section{Experience}
${experienceSection}

\\section{Education}
${educationSection}

\\section{Skills}
${skillsTags}

${projectsSection ? `\\section{Projects}\n${projectsSection}` : ''}

\\end{document}`
}
