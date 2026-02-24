import { ParsedResume } from '@/types/templates'

/**
 * Modern Minimal Template
 * - Charter font, 10pt, single page
 * - Clean thin section dividers
 * - Dates right-aligned with \hfill
 * - Black text only, ATS-optimized
 */
export function generateModernMinimalLatex(resume: ParsedResume): string {
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

  const educationSection = resume.education.map(edu =>
    `\\textbf{${esc(edu.school)}} \\hfill ${esc(edu.graduationDate)} \\\\
${esc(edu.degree)}${edu.gpa ? ` \\enspace GPA: ${esc(edu.gpa)}` : ''}${edu.honors?.length ? ` \\enspace ${edu.honors.map(esc).join(', ')}` : ''}`
  ).join('\n\\vspace{4pt}\n')

  const skillsSection = resume.skills.length > 0
    ? `\\textbf{Technical Skills:} ${resume.skills.map(esc).join(', ')}`
    : ''

  const experienceSection = resume.experience.map(exp =>
    `\\textbf{${esc(exp.title)}}, ${esc(exp.company)} \\hfill ${esc(exp.startDate)} -- ${esc(exp.endDate)}
\\begin{itemize}[leftmargin=1.2em, topsep=2pt, parsep=1pt, itemsep=1pt]
${exp.bullets.map(b => `  \\item ${esc(b)}`).join('\n')}
\\end{itemize}`
  ).join('\n\\vspace{4pt}\n')

  const projectsSection = (resume.projects || []).map(p =>
    `\\textbf{${esc(p.name)}} --- ${esc(p.description)}${p.technologies?.length ? ` \\enspace \\textit{${p.technologies.map(esc).join(', ')}}` : ''}`
  ).join('\n\\vspace{3pt}\n')

  const certificationsSection = (resume.certifications || []).map(c => esc(c)).join(' $\\cdot$ ')

  return `\\documentclass[10pt, letterpaper]{article}

\\usepackage[top=0.5cm, bottom=0.5cm, left=1.2cm, right=1.2cm]{geometry}
\\usepackage{titlesec}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{iftex}

\\ifPDFTeX
  \\input{glyphtounicode}
  \\pdfgentounicode=1
  \\usepackage[T1]{fontenc}
  \\usepackage[utf8]{inputenc}
\\fi

\\usepackage{charter}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

\\titleformat{\\section}{\\bfseries\\normalsize}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{5pt}

\\renewcommand{\\labelitemi}{\\scriptsize$\\bullet$}

\\begin{document}

\\begin{center}
  {\\fontsize{20pt}{22pt}\\selectfont ${esc(resume.fullName)}}

  \\vspace{4pt}

  {\\footnotesize ${contactParts.join(' $|$ ')}}
\\end{center}

\\vspace{4pt}

\\section{Education}
${educationSection}

${skillsSection ? `\\section{Technical Skills}\n${skillsSection}` : ''}

\\section{Experience}
${experienceSection}

${projectsSection ? `\\section{Projects}\n${projectsSection}` : ''}

${certificationsSection ? `\\section{Certifications}\n${certificationsSection}` : ''}

\\end{document}`
}
