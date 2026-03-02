import { ParsedResume } from '@/types/templates'
import { escapeLatex } from '../escape'

/**
 * Creative Bold Template
 * - Black accent color for name, section headers, bullets
 * - Bold name at 20pt
 * - Section headers with thick black rule below
 * - Skills as bold inline tags separated by dots
 * - Eye-catching design for creative roles
 */
export function generateCreativeBoldLatex(resume: ParsedResume): string {
  const esc = escapeLatex

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
    const lines = [firstLine]
    // Degree + GPA on one line
    const degreeParts = [edu.degree ? esc(edu.degree) : '', edu.gpa ? `GPA: ${esc(edu.gpa)}` : ''].filter(Boolean)
    if (degreeParts.length > 0) lines.push(degreeParts.join(' $|$ '))
    // Honors on their own line (but not coursework)
    const honors = (edu.honors || []).filter(h => !/coursework/i.test(h))
    if (honors.length > 0) lines.push(honors.map(esc).join(' $|$ '))
    // Coursework on a separate line
    const coursework = (edu.honors || []).find(h => /coursework/i.test(h))
    if (coursework) {
      const cwText = coursework.replace(/^Relevant Coursework:\\s*/i, '')
      lines.push(`\\textit{Relevant Coursework:} ${esc(cwText)}`)
    }
    return lines.join(' \\\\\\\\\n')
  }
  const educationSection = resume.education.map(fmtEdu).join('\n\\vspace{3pt}\n')

  const skillsTags = resume.skills.map(s => `\\textbf{${esc(s)}}`).join(' $\\cdot$ ')

  const projectsSection = (resume.projects || []).map(p =>
    `\\textbf{${esc(p.name)}}${p.description ? ` --- ${esc(p.description)}` : ''}${p.technologies?.length ? ` $|$ \\textit{${p.technologies.map(esc).join(', ')}}` : ''}`
  ).join('\n\\vspace{4pt}\n')

  const certificationsSection = (resume.certifications || []).map(c => esc(c)).join(' $\\cdot$ ')

  return `\\documentclass[10pt, letterpaper]{article}

\\usepackage[top=0.4cm, bottom=0.4cm, left=1.2cm, right=1.2cm]{geometry}
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

% Section headers: bold, black, with thick black rule below (no overlap)
\\titleformat{\\section}{\\bfseries\\normalsize\\scshape}{}{0pt}{}[\\vspace{2pt}\\titlerule[1.5pt]]
\\titlespacing{\\section}{0pt}{8pt}{5pt}

\\renewcommand{\\labelitemi}{\\scriptsize$\\bullet$}

\\begin{document}
\\sloppy
\\emergencystretch=1em

\\begin{center}
  {\\fontsize{20pt}{22pt}\\selectfont\\textbf{${esc(resume.fullName)}}}\\\\[0.3em]
  {\\footnotesize ${contactParts.join(' $|$ ')}}
\\end{center}

\\vspace{3pt}

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
