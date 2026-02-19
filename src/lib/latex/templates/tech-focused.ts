import { ParsedResume } from '@/types/templates'

/**
 * Tech-Focused Template
 * Skills-first layout for technical roles
 * - Charter font
 * - Clean section dividers
 * - Skills prominently displayed
 * - No colors (black text)
 * - ATS-optimized
 */
export function generateTechFocusedLatex(resume: ParsedResume): string {
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

  // Categorize skills
  const categorizeSkills = (skills: string[]) => {
    const categories: { [key: string]: string[] } = {
      'Programming Languages': [],
      'Frameworks & Libraries': [],
      'Tools & Platforms': [],
      'Other': []
    }

    const languageKeywords = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'r', 'matlab', 'scala']
    const frameworkKeywords = ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'next', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit', 'scipy']
    const toolKeywords = ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'terraform', 'linux', 'mongodb', 'postgresql', 'redis', 'tableau', 'jupyter', 'colab']

    skills.forEach(skill => {
      const lower = skill.toLowerCase()
      if (languageKeywords.some(k => lower.includes(k))) {
        categories['Programming Languages'].push(skill)
      } else if (frameworkKeywords.some(k => lower.includes(k))) {
        categories['Frameworks & Libraries'].push(skill)
      } else if (toolKeywords.some(k => lower.includes(k))) {
        categories['Tools & Platforms'].push(skill)
      } else {
        categories['Other'].push(skill)
      }
    })

    return categories
  }

  const skillCategories = categorizeSkills(resume.skills)

  // Build skills section with categories
  const skillsSection = Object.entries(skillCategories)
    .filter(([, skills]) => skills.length > 0)
    .map(([category, skills]) => `    \\begin{onecolentry}
        \\textbf{${category}:} ${skills.map(s => escapeTex(s)).join(', ')}
    \\end{onecolentry}`)
    .join('\n\n    \\vspace{0.1 cm}\n\n')

  // Build experience section
  const experienceSection = resume.experience.map(exp => `
    \\begin{twocolentry}{
        ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}
    }
        \\textbf{${escapeTex(exp.title)}}, ${escapeTex(exp.company)}
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
        ${escapeTex(edu.degree)}${edu.gpa ? ` \\textbar{} GPA: ${escapeTex(edu.gpa)}` : ''}
    \\end{twocolentry}
`).join('\n\\vspace{0.2 cm}\n')

  // Build projects section
  const projectsSection = resume.projects && resume.projects.length > 0
    ? resume.projects.map(p => `
    \\begin{onecolentry}
        \\textbf{${escapeTex(p.name)}:} ${escapeTex(p.description)}${p.technologies && p.technologies.length > 0 ? ` \\textbar{} \\textit{${p.technologies.map(t => escapeTex(t)).join(', ')}}` : ''}
    \\end{onecolentry}
`).join('\n\\vspace{0.1 cm}\n')
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
    top=1.2 cm,
    bottom=1.2 cm,
    left=1.8 cm,
    right=1.8 cm,
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
\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{-1pt}{0.2 cm}{0.3 cm}

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
        {\\fontsize{25pt}{25pt}\\selectfont\\bfseries ${escapeTex(resume.fullName)}}\\\\[0.4em]
        {\\small ${contactParts.join(' \\textbar{} ')}}
    \\end{center}

    \\vspace{0.3 cm}

    % Education first for students
    \\section{Education}
${educationSection}

    % Technical Skills prominently
    \\section{Technical Skills}
${skillsSection}

    % Experience
    \\section{Research \\& Work Experience}
${experienceSection}

${projectsSection ? `
    % Projects
    \\section{Selected Projects}
${projectsSection}` : ''}

\\end{document}`
}
