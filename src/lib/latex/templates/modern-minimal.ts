import { ParsedResume } from '@/types/templates'

/**
 * Modern Minimal Template
 * Based on ATS-optimized, clean professional style
 * - Charter font (10pt for one-page fit)
 * - Clean section dividers
 * - Two-column layout for dates
 * - No colors (black text)
 * - Machine readable (glyphtounicode)
 * - Optimized for single page
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
      .replace(/\|/g, '\\textbar{}')
  }

  // Limit bullets per job to ensure one-page fit (max 4 per job, prioritize first ones)
  const limitBullets = (bullets: string[], max: number = 4): string[] => {
    return bullets.slice(0, max)
  }

  // Limit experience entries for one page (max 3-4 jobs)
  const limitedExperience = resume.experience.slice(0, 4)

  // Build experience section
  const experienceSection = limitedExperience.map(exp => `
    \\begin{twocolentry}{
        ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}
    }
        \\textbf{${escapeTex(exp.title)}}, ${escapeTex(exp.company)}${exp.location ? ` | ${escapeTex(exp.location)}` : ''}
    \\end{twocolentry}

    \\begin{onecolentry}
        \\begin{highlights}
${limitBullets(exp.bullets).map(b => `            \\item ${escapeTex(b)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}

    \\vspace{0.08 cm}
`).join('\n')

  // Build education section (max 2 entries)
  const limitedEducation = resume.education.slice(0, 2)
  const educationSection = limitedEducation.map(edu => `
    \\begin{twocolentry}{
        ${escapeTex(edu.graduationDate)}
    }
        \\textbf{${escapeTex(edu.school)}} \\\\
        ${escapeTex(edu.degree)}${edu.gpa ? ` | GPA: ${escapeTex(edu.gpa)}` : ''}
    \\end{twocolentry}
`).join('\n\\vspace{0.08 cm}\n')

  // Build skills section - group by category if possible (single line)
  const skillsSection = resume.skills.length > 0
    ? `    \\begin{onecolentry}
        \\textbf{Technical Skills:} ${resume.skills.slice(0, 15).map(s => escapeTex(s)).join(', ')}
    \\end{onecolentry}`
    : ''

  // Build projects section if present (max 2 projects)
  const limitedProjects = resume.projects?.slice(0, 2) || []
  const projectsSection = limitedProjects.length > 0
    ? limitedProjects.map(p => `
    \\begin{onecolentry}
        \\textbf{${escapeTex(p.name)}:} ${escapeTex(p.description).slice(0, 150)}${p.description.length > 150 ? '...' : ''}${p.technologies && p.technologies.length > 0 ? ` \\textbar{} \\textit{${p.technologies.slice(0, 5).map(t => escapeTex(t)).join(', ')}}` : ''}
    \\end{onecolentry}
`).join('\n\\vspace{0.05 cm}\n')
    : ''

  // Contact info
  const contactParts = [
    resume.email ? `\\mbox{\\hrefWithoutArrow{mailto:${resume.email}}{${escapeTex(resume.email)}}}` : '',
    resume.phone ? `\\mbox{${escapeTex(resume.phone)}}` : '',
    resume.linkedin ? `\\mbox{\\hrefWithoutArrow{${resume.linkedin}}{LinkedIn}}` : '',
    resume.location ? `\\mbox{${escapeTex(resume.location)}}` : ''
  ].filter(Boolean)

  const contactLine = contactParts.join('%\n        \\kern 5.0 pt%\n        \\AND%\n        \\kern 5.0 pt%\n        ')

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
    pdfcreator={LaTeX},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref}
\\usepackage[pscoord]{eso-pic}
\\usepackage{calc}
\\usepackage{bookmark}
\\usepackage{lastpage}
\\usepackage{changepage}
\\usepackage{paracol}
\\usepackage{ifthen}
\\usepackage{needspace}
\\usepackage{iftex}

% ATS-friendly settings
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
\\fi

\\usepackage{charter}

% Layout settings - compact
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
\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\normalsize}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{-1pt}{0.15cm}{0.15cm}

% Custom bullet points - smaller
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\scriptsize$\\bullet$}}$}

% Highlights environment - tighter spacing
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.03cm,
        parsep=0.03cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0cm + 10pt
    ]
}{
    \\end{itemize}
}

% One column entry
\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{0cm + 0.00001cm}{0cm + 0.00001cm}
}{
    \\end{adjustwidth}
}

% Two column entry (for dates)
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

% Header environment
\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.2}
}{
    \\par\\kern\\topsep
}

\\let\\hrefWithoutArrow\\href

\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{$|$}

    % Header - compact
    \\begin{header}
        \\fontsize{20pt}{20pt}\\selectfont ${escapeTex(resume.fullName)}

        \\vspace{3pt}

        \\footnotesize
        \\mbox{}%
        \\kern 5.0pt%
        \\AND%
        \\kern 5.0pt%
        ${contactLine}
    \\end{header}

    \\vspace{3pt}

    % Education
    \\section{Education}
${educationSection}

    % Skills
    \\section{Technical Skills}
${skillsSection}

    % Experience
    \\section{Experience}
${experienceSection}

${projectsSection ? `    % Projects
    \\section{Projects}
${projectsSection}` : ''}

\\end{document}`
}
