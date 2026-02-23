import { ParsedResume } from '@/types/templates'

/**
 * Creative Bold Template
 * - Teal accent color for section headings and name
 * - Bold name at 22pt with accent color
 * - Section headings with colored left rule
 * - Skills displayed as bold inline tags
 * - Optimized for single page
 */
export function generateCreativeBoldLatex(resume: ParsedResume): string {
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
      .replace(/\|/g, '\\textbar{}')
  }

  const limitBullets = (bullets: string[], max: number = 4): string[] => {
    return bullets.slice(0, max)
  }

  const limitedExperience = resume.experience.slice(0, 4)

  // Build experience section
  const experienceSection = limitedExperience.map(exp => `
    \\noindent\\textbf{${escapeTex(exp.title)}} \\hfill \\textit{${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}} \\\\
    \\textit{${escapeTex(exp.company)}}${exp.location ? ` \\textbar{} ${escapeTex(exp.location)}` : ''} \\\\[-0.3em]
    \\begin{itemize}[leftmargin=1.2em, topsep=0.1em, parsep=0.05em, itemsep=0.05em]
${limitBullets(exp.bullets).map(b => `      \\item ${escapeTex(b)}`).join('\n')}
    \\end{itemize}
    \\vspace{0.15cm}
`).join('\n')

  // Build education section
  const limitedEducation = resume.education.slice(0, 2)
  const educationSection = limitedEducation.map(edu => `
    \\noindent\\textbf{${escapeTex(edu.school)}} \\hfill ${escapeTex(edu.graduationDate)} \\\\
    ${escapeTex(edu.degree)}${edu.gpa ? ` \\textbar{} GPA: ${escapeTex(edu.gpa)}` : ''}
`).join('\n\\vspace{0.1cm}\n')

  // Build skills as bold inline tags
  const skillsSection = resume.skills.length > 0
    ? resume.skills.slice(0, 15).map(s => `\\textbf{${escapeTex(s)}}`).join(' \\enspace $\\cdot$ \\enspace ')
    : ''

  // Build projects section
  const limitedProjects = resume.projects?.slice(0, 2) || []
  const projectsSection = limitedProjects.length > 0
    ? limitedProjects.map(p => `
    \\noindent\\textbf{${escapeTex(p.name)}} --- ${escapeTex(p.description).slice(0, 150)}${p.description.length > 150 ? '...' : ''}${p.technologies && p.technologies.length > 0 ? ` \\textbar{} \\textit{${p.technologies.slice(0, 5).map(t => escapeTex(t)).join(', ')}}` : ''}
`).join('\n\\vspace{0.08cm}\n')
    : ''

  // Contact info
  const contactParts = [
    resume.email ? escapeTex(resume.email) : '',
    resume.phone ? escapeTex(resume.phone) : '',
    resume.linkedin ? `\\href{${resume.linkedin}}{LinkedIn}` : '',
    resume.location ? escapeTex(resume.location) : ''
  ].filter(Boolean)

  const contactLine = contactParts.join(' $|$ ')

  return `\\documentclass[10pt, letterpaper]{article}

% Packages
\\usepackage[
    ignoreheadfoot,
    top=0.5cm,
    bottom=0.5cm,
    left=1.2cm,
    right=1.2cm,
    footskip=0.5cm
]{geometry}
\\usepackage{titlesec}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[
    pdftitle={${escapeTex(resume.fullName)}'s Resume},
    pdfauthor={${escapeTex(resume.fullName)}},
    colorlinks=true,
    urlcolor={rgb:red,0;green,128;blue,128}
]{hyperref}
\\usepackage[pscoord]{eso-pic}
\\usepackage{calc}
\\usepackage{bookmark}
\\usepackage{iftex}

% ATS-friendly settings
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
\\fi

\\usepackage{charter}

% Colors
\\definecolor{accent}{RGB}{0, 128, 128}

% Layout
\\raggedright
\\pagestyle{empty}
\\setcounter{secnumdepth}{0}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\pagenumbering{gobble}

% Section formatting with colored left rule
\\titleformat{\\section}{
  \\needspace{4\\baselineskip}\\color{accent}\\bfseries\\normalsize
}{}{0pt}{\\hspace{-0.3em}}[\\vspace{-0.5em}\\color{accent}\\titlerule[1.5pt]]
\\titlespacing{\\section}{0pt}{0.2cm}{0.15cm}

% Bullet style
\\renewcommand\\labelitemi{\\textcolor{accent}{$\\vcenter{\\hbox{\\scriptsize$\\bullet$}}$}}

\\begin{document}

    % Header
    \\begin{center}
        {\\fontsize{22pt}{22pt}\\selectfont\\textbf{\\textcolor{accent}{${escapeTex(resume.fullName)}}}}

        \\vspace{4pt}

        {\\footnotesize ${contactLine}}
    \\end{center}

    \\vspace{3pt}

${resume.summary ? `    % Summary
    \\section{Summary}
    \\noindent ${escapeTex(resume.summary)}
    \\vspace{0.1cm}

` : ''}
    % Experience
    \\section{Experience}
${experienceSection}

    % Education
    \\section{Education}
${educationSection}

    % Skills
    \\section{Skills}
    \\noindent ${skillsSection}

${projectsSection ? `    % Projects
    \\section{Projects}
${projectsSection}` : ''}

\\end{document}`
}
