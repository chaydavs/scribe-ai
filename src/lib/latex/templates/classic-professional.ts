import { ParsedResume } from '@/types/templates'

/**
 * Classic Professional Template
 * Traditional corporate style with clean formatting
 * - Charter font (10pt for one-page fit)
 * - Clean section dividers
 * - Two-column layout for dates
 * - No colors (black text)
 * - ATS-optimized
 * - Optimized for single page
 */
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
      .replace(/\|/g, '\\textbar{}')
  }

  // Limit bullets per job to ensure one-page fit
  const limitBullets = (bullets: string[], max: number = 4): string[] => {
    return bullets.slice(0, max)
  }

  // Limit experience entries (max 4 jobs)
  const limitedExperience = resume.experience.slice(0, 4)

  // Build experience section
  const experienceSection = limitedExperience.map(exp => `
    \\begin{twocolentry}{
        ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}
    }
        \\textbf{${escapeTex(exp.title)}} \\\\
        \\textit{${escapeTex(exp.company)}}${exp.location ? `, ${escapeTex(exp.location)}` : ''}
    \\end{twocolentry}

    \\begin{onecolentry}
        \\begin{highlights}
${limitBullets(exp.bullets).map(b => `            \\item ${escapeTex(b)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}

    \\vspace{0.08cm}
`).join('\n')

  // Build education section (max 2 entries)
  const limitedEducation = resume.education.slice(0, 2)
  const educationSection = limitedEducation.map(edu => `
    \\begin{twocolentry}{
        ${escapeTex(edu.graduationDate)}
    }
        \\textbf{${escapeTex(edu.school)}} \\\\
        ${escapeTex(edu.degree)}${edu.gpa ? ` \\textbar{} GPA: ${escapeTex(edu.gpa)}` : ''}${edu.honors && edu.honors.length > 0 ? ` \\textbar{} ${edu.honors.slice(0, 2).map(h => escapeTex(h)).join(', ')}` : ''}
    \\end{twocolentry}
`).join('\n\\vspace{0.08cm}\n')

  // Build skills section (limit to fit one line or two)
  const skillsSection = resume.skills.length > 0
    ? `    \\begin{onecolentry}
        \\textbf{Skills:} ${resume.skills.slice(0, 15).map(s => escapeTex(s)).join(', ')}
    \\end{onecolentry}`
    : ''

  // Build projects section (max 2 projects)
  const limitedProjects = resume.projects?.slice(0, 2) || []
  const projectsSection = limitedProjects.length > 0
    ? limitedProjects.map(p => `
    \\begin{onecolentry}
        \\textbf{${escapeTex(p.name)}:} ${escapeTex(p.description).slice(0, 150)}${p.description.length > 150 ? '...' : ''}${p.technologies && p.technologies.length > 0 ? ` \\textbar{} ${p.technologies.slice(0, 5).map(t => escapeTex(t)).join(', ')}` : ''}
    \\end{onecolentry}
`).join('\n\\vspace{0.05cm}\n')
    : ''

  // Summary section (truncate if too long)
  const summarySection = resume.summary
    ? `    \\section{Professional Summary}
    \\begin{onecolentry}
        ${escapeTex(resume.summary.slice(0, 300))}${resume.summary.length > 300 ? '...' : ''}
    \\end{onecolentry}

    `
    : ''

  // Contact info
  const contactParts = [
    resume.email ? `\\hrefWithoutArrow{mailto:${resume.email}}{${escapeTex(resume.email)}}` : '',
    resume.phone ? escapeTex(resume.phone) : '',
    resume.linkedin ? `\\hrefWithoutArrow{${resume.linkedin}}{LinkedIn}` : '',
    resume.location ? escapeTex(resume.location) : ''
  ].filter(Boolean)

  return `\\documentclass[10pt, letterpaper]{article}

% Packages - Tight margins for one-page fit
\\usepackage[
    ignoreheadfoot,
    top=0.5cm,
    bottom=0.5cm,
    left=1.2cm,
    right=1.2cm,
    footskip=0.5cm
]{geometry}
\\usepackage{titlesec}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage[dvipsnames]{xcolor}
\\definecolor{primaryColor}{RGB}{0, 0, 0}
\\usepackage{enumitem}
\\usepackage{amsmath}
\\usepackage[
    pdftitle={${escapeTex(resume.fullName)}'s Resume},
    pdfauthor={${escapeTex(resume.fullName)}},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref}
\\usepackage{changepage}
\\usepackage{paracol}
\\usepackage{needspace}
\\usepackage{iftex}

% ATS-friendly
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
\\fi

\\usepackage{charter}

% Layout - compact
\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt}
\\pagestyle{empty}
\\setcounter{secnumdepth}{0}
\\setlength{\\parindent}{0pt}
\\setlength{\\topskip}{0pt}
\\setlength{\\columnsep}{0.15cm}
\\setlength{\\parskip}{0pt}
\\pagenumbering{gobble}

% Section formatting - reduced spacing
\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\normalsize\\scshape}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{-1pt}{0.15cm}{0.15cm}

% Custom environments - tighter
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\scriptsize$\\bullet$}}$}

\\newenvironment{highlights}{
    \\begin{itemize}[topsep=0.03cm, parsep=0.03cm, partopsep=0pt, itemsep=0pt, leftmargin=10pt]
}{
    \\end{itemize}
}

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{0.00001cm}{0.00001cm}
}{
    \\end{adjustwidth}
}

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
}

\\let\\hrefWithoutArrow\\href

\\begin{document}

    % Header - compact
    \\begin{center}
        {\\Large\\bfseries\\scshape ${escapeTex(resume.fullName)}}\\\\[0.2em]
        {\\footnotesize ${contactParts.join(' \\textbar{} ')}}
    \\end{center}

    \\vspace{0.15cm}

${summarySection}
    % Experience
    \\section{Professional Experience}
${experienceSection}

    % Education
    \\section{Education}
${educationSection}

    % Skills
    \\section{Skills}
${skillsSection}

${projectsSection ? `
    % Projects
    \\section{Projects}
${projectsSection}` : ''}

\\end{document}`
}
