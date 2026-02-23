import { ParsedResume } from '@/types/templates'

/**
 * Executive Template
 * - Dark navy accent (RGB 25, 25, 75), subtle and refined
 * - Name in small caps at 18pt
 * - Prominent "Executive Summary" section
 * - 3 bullets per role (fewer, more impactful)
 * - Skills renamed to "Core Competencies" as compact paragraph
 * - No projects section (executives rarely list projects)
 * - 5 experience entries (longer careers)
 * - Optimized for single page
 */
export function generateExecutiveLatex(resume: ParsedResume): string {
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

  const limitBullets = (bullets: string[], max: number = 3): string[] => {
    return bullets.slice(0, max)
  }

  // 5 experience entries for longer executive careers
  const limitedExperience = resume.experience.slice(0, 5)

  // Build experience section
  const experienceSection = limitedExperience.map(exp => `
    \\noindent\\textbf{${escapeTex(exp.title)}} \\hfill ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)} \\\\
    \\textit{${escapeTex(exp.company)}}${exp.location ? `, ${escapeTex(exp.location)}` : ''} \\\\[-0.3em]
    \\begin{itemize}[leftmargin=1.2em, topsep=0.08em, parsep=0.03em, itemsep=0.03em]
${limitBullets(exp.bullets).map(b => `      \\item ${escapeTex(b)}`).join('\n')}
    \\end{itemize}
    \\vspace{0.12cm}
`).join('\n')

  // Build education section
  const limitedEducation = resume.education.slice(0, 2)
  const educationSection = limitedEducation.map(edu => `
    \\noindent\\textbf{${escapeTex(edu.school)}} \\hfill ${escapeTex(edu.graduationDate)} \\\\
    ${escapeTex(edu.degree)}${edu.gpa ? ` \\textbar{} GPA: ${escapeTex(edu.gpa)}` : ''}
`).join('\n\\vspace{0.08cm}\n')

  // Core Competencies as compact paragraph
  const competenciesSection = resume.skills.length > 0
    ? resume.skills.slice(0, 18).map(s => escapeTex(s)).join(' $\\cdot$ ')
    : ''

  // Contact info
  const contactParts = [
    resume.email ? escapeTex(resume.email) : '',
    resume.phone ? escapeTex(resume.phone) : '',
    resume.linkedin ? `\\href{${resume.linkedin}}{LinkedIn}` : '',
    resume.location ? escapeTex(resume.location) : ''
  ].filter(Boolean)

  const contactLine = contactParts.join(' \\quad $|$ \\quad ')

  return `\\documentclass[10pt, letterpaper]{article}

% Packages
\\usepackage[
    ignoreheadfoot,
    top=0.5cm,
    bottom=0.5cm,
    left=1.4cm,
    right=1.4cm,
    footskip=0.5cm
]{geometry}
\\usepackage{titlesec}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[
    pdftitle={${escapeTex(resume.fullName)}'s Resume},
    pdfauthor={${escapeTex(resume.fullName)}},
    colorlinks=true,
    urlcolor={rgb:red,25;green,25;blue,75}
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
\\definecolor{navy}{RGB}{25, 25, 75}

% Layout
\\raggedright
\\pagestyle{empty}
\\setcounter{secnumdepth}{0}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\pagenumbering{gobble}

% Section formatting - refined with thin rule
\\titleformat{\\section}{
  \\needspace{4\\baselineskip}\\color{navy}\\bfseries\\normalsize\\scshape
}{}{0pt}{}[\\vspace{1pt}\\titlerule[0.6pt]]
\\titlespacing{\\section}{0pt}{0.2cm}{0.12cm}

% Bullet style - subtle
\\renewcommand\\labelitemi{\\textcolor{navy}{$\\vcenter{\\hbox{\\scriptsize$\\bullet$}}$}}

\\begin{document}

    % Header - refined small caps
    \\begin{center}
        {\\fontsize{18pt}{18pt}\\selectfont\\textsc{\\textcolor{navy}{${escapeTex(resume.fullName)}}}}

        \\vspace{4pt}

        {\\footnotesize ${contactLine}}
    \\end{center}

    \\vspace{3pt}

${resume.summary ? `    % Executive Summary
    \\section{Executive Summary}
    \\noindent ${escapeTex(resume.summary)}
    \\vspace{0.1cm}

` : ''}
    % Professional Experience
    \\section{Professional Experience}
${experienceSection}

    % Education
    \\section{Education}
${educationSection}

    % Core Competencies
    \\section{Core Competencies}
    \\noindent ${competenciesSection}

\\end{document}`
}
