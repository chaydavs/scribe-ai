import { ParsedResume } from '@/types/templates'

/**
 * Classic Professional Template
 * Traditional corporate style with clean formatting
 * - Charter font
 * - Clean section dividers
 * - Two-column layout for dates
 * - No colors (black text)
 * - ATS-optimized
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

  // Build experience section
  const experienceSection = resume.experience.map(exp => `
    \\begin{twocolentry}{
        ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}
    }
        \\textbf{${escapeTex(exp.title)}} \\\\
        \\textit{${escapeTex(exp.company)}}${exp.location ? `, ${escapeTex(exp.location)}` : ''}
    \\end{twocolentry}

    \\begin{onecolentry}
        \\begin{highlights}
${exp.bullets.map(b => `            \\item ${escapeTex(b)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}

    \\vspace{0.2 cm}
`).join('\n')

  // Build education section
  const educationSection = resume.education.map(edu => `
    \\begin{twocolentry}{
        ${escapeTex(edu.graduationDate)}
    }
        \\textbf{${escapeTex(edu.school)}} \\\\
        ${escapeTex(edu.degree)}${edu.gpa ? ` \\textbar{} GPA: ${escapeTex(edu.gpa)}` : ''}${edu.honors && edu.honors.length > 0 ? ` \\textbar{} ${edu.honors.map(h => escapeTex(h)).join(', ')}` : ''}
    \\end{twocolentry}
`).join('\n\\vspace{0.2 cm}\n')

  // Build skills section
  const skillsSection = resume.skills.length > 0
    ? `    \\begin{onecolentry}
        \\textbf{Skills:} ${resume.skills.map(s => escapeTex(s)).join(', ')}
    \\end{onecolentry}`
    : ''

  // Build projects section
  const projectsSection = resume.projects && resume.projects.length > 0
    ? resume.projects.map(p => `
    \\begin{onecolentry}
        \\textbf{${escapeTex(p.name)}:} ${escapeTex(p.description)}${p.technologies && p.technologies.length > 0 ? ` \\textbar{} ${p.technologies.map(t => escapeTex(t)).join(', ')}` : ''}
    \\end{onecolentry}
`).join('\n\\vspace{0.1 cm}\n')
    : ''

  // Summary section
  const summarySection = resume.summary
    ? `    \\section{Professional Summary}
    \\begin{onecolentry}
        ${escapeTex(resume.summary)}
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

  return `\\documentclass[11pt, letterpaper]{article}

% Packages
\\usepackage[
    ignoreheadfoot,
    top=1.3 cm,
    bottom=1.3 cm,
    left=2 cm,
    right=2 cm,
    footskip=1.0 cm
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

% Layout
\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt}
\\pagestyle{empty}
\\setcounter{secnumdepth}{0}
\\setlength{\\parindent}{0pt}
\\setlength{\\topskip}{0pt}
\\setlength{\\columnsep}{0.15cm}
\\pagenumbering{gobble}

% Section formatting
\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large\\scshape}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{-1pt}{0.3 cm}{0.3 cm}

% Custom environments
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}

\\newenvironment{highlights}{
    \\begin{itemize}[topsep=0.10 cm, parsep=0.10 cm, partopsep=0pt, itemsep=0pt, leftmargin=10pt]
}{
    \\end{itemize}
}

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{0.00001 cm}{0.00001 cm}
}{
    \\end{adjustwidth}
}

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
}

\\let\\hrefWithoutArrow\\href

\\begin{document}

    % Header
    \\begin{center}
        {\\LARGE\\bfseries\\scshape ${escapeTex(resume.fullName)}}\\\\[0.4em]
        {\\small ${contactParts.join(' \\textbar{} ')}}
    \\end{center}

    \\vspace{0.3 cm}

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
