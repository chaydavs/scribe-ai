import { ParsedResume } from '@/types/templates'

/**
 * Modern Minimal Template
 * Based on ATS-optimized, clean professional style
 * - Charter font
 * - Clean section dividers
 * - Two-column layout for dates
 * - No colors (black text)
 * - Machine readable (glyphtounicode)
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

  // Build experience section
  const experienceSection = resume.experience.map(exp => `
    \\begin{twocolentry}{
        ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}
    }
        \\textbf{${escapeTex(exp.title)}}, ${escapeTex(exp.company)}${exp.location ? ` | ${escapeTex(exp.location)}` : ''}
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
        ${escapeTex(edu.degree)}${edu.gpa ? ` | GPA: ${escapeTex(edu.gpa)}` : ''}
    \\end{twocolentry}
`).join('\n\\vspace{0.2 cm}\n')

  // Build skills section - group by category if possible
  const skillsSection = resume.skills.length > 0
    ? `    \\begin{onecolentry}
        \\textbf{Technical Skills:} ${resume.skills.map(s => escapeTex(s)).join(', ')}
    \\end{onecolentry}`
    : ''

  // Build projects section if present
  const projectsSection = resume.projects && resume.projects.length > 0
    ? resume.projects.map(p => `
    \\begin{onecolentry}
        \\textbf{${escapeTex(p.name)}:} ${escapeTex(p.description)}${p.technologies && p.technologies.length > 0 ? ` \\textbar{} \\textit{${p.technologies.map(t => escapeTex(t)).join(', ')}}` : ''}
    \\end{onecolentry}
`).join('\n\\vspace{0.1 cm}\n')
    : ''

  // Contact info
  const contactParts = [
    resume.email ? `\\mbox{\\hrefWithoutArrow{mailto:${resume.email}}{${escapeTex(resume.email)}}}` : '',
    resume.phone ? `\\mbox{${escapeTex(resume.phone)}}` : '',
    resume.linkedin ? `\\mbox{\\hrefWithoutArrow{${resume.linkedin}}{LinkedIn}}` : '',
    resume.location ? `\\mbox{${escapeTex(resume.location)}}` : ''
  ].filter(Boolean)

  const contactLine = contactParts.join('%\n        \\kern 5.0 pt%\n        \\AND%\n        \\kern 5.0 pt%\n        ')

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

% Layout settings
\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt}
\\pagestyle{empty}
\\setcounter{secnumdepth}{0}
\\setlength{\\parindent}{0pt}
\\setlength{\\topskip}{0pt}
\\setlength{\\columnsep}{0.15cm}
\\pagenumbering{gobble}

% Section formatting
\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{-1pt}{0.2 cm}{0.3 cm}

% Custom bullet points
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}

% Highlights environment
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \\end{itemize}
}

% One column entry
\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{0 cm + 0.00001 cm}{0 cm + 0.00001 cm}
}{
    \\end{adjustwidth}
}

% Two column entry (for dates)
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

% Header environment
\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.5}
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

    % Header
    \\begin{header}
        \\fontsize{25 pt}{25 pt}\\selectfont ${escapeTex(resume.fullName)}

        \\vspace{5 pt}

        \\normalsize
        \\mbox{}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        ${contactLine}
    \\end{header}

    \\vspace{5 pt}

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
