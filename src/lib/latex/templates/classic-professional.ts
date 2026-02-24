import { ParsedResume } from '@/types/templates'

/**
 * Classic Professional Template
 * - Charter font, 10pt, single page
 * - Small-caps section headers with thin rule
 * - Name in small caps
 * - Professional Summary section
 * - Traditional corporate feel
 */
export function generateClassicProfessionalLatex(resume: ParsedResume): string {
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

  const summarySection = resume.summary
    ? `\\section{Professional Summary}\n${esc(resume.summary)}\n\n`
    : ''

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
    const lines = [firstLine]
    // Degree + GPA on one line
    const degreeParts = [edu.degree ? esc(edu.degree) : '', edu.gpa ? `GPA: ${esc(edu.gpa)}` : ''].filter(Boolean)
    if (degreeParts.length > 0) lines.push(degreeParts.join(' $|$ '))
    // Honors (minor, etc.) on their own line — but NOT coursework
    const honors = (edu.honors || []).filter(h => !/coursework/i.test(h))
    if (honors.length > 0) lines.push(honors.map(esc).join(' $|$ '))
    // Coursework on a separate line with italic label
    const coursework = (edu.honors || []).find(h => /coursework/i.test(h))
    if (coursework) {
      const cwText = coursework.replace(/^Relevant Coursework:\s*/i, '')
      lines.push(`\\textit{Relevant Coursework:} ${esc(cwText)}`)
    }
    return lines.join(' \\\\\n')
  }
  const educationSection = resume.education.map(fmtEdu).join('\n\\vspace{4pt}\n')

  const skillsSection = resume.skills.length > 0
    ? resume.skills.map(esc).join(', ')
    : ''

  const projectsSection = (resume.projects || []).map(p => {
    const header = `\\textbf{${esc(p.name)}}${p.technologies?.length ? ` $|$ \\textit{${p.technologies.map(esc).join(', ')}}` : ''}`
    if (!p.description) return header
    return `${header}
\\begin{itemize}[leftmargin=1.2em, topsep=2pt, parsep=1pt, itemsep=1pt]
  \\item ${esc(p.description)}
\\end{itemize}`
  }).join('\n\\vspace{4pt}\n')

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

\\titleformat{\\section}{\\bfseries\\normalsize\\scshape}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{5pt}

\\renewcommand{\\labelitemi}{\\scriptsize$\\bullet$}

\\begin{document}

\\begin{center}
  {\\Large\\bfseries\\scshape ${esc(resume.fullName)}}\\\\[0.3em]
  {\\footnotesize ${contactParts.join(' $|$ ')}}
\\end{center}

\\vspace{4pt}

${summarySection}\\section{Professional Experience}
${experienceSection}

\\section{Education}
${educationSection}

${skillsSection ? `\\section{Skills}\n${skillsSection}` : ''}

${projectsSection ? `\\section{Projects}\n${projectsSection}` : ''}

${certificationsSection ? `\\section{Certifications}\n${certificationsSection}` : ''}

\\end{document}`
}
