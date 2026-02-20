import { ParsedResume } from '@/types/templates'

/**
 * Tech-Focused Template
 * Skills-first layout for technical roles
 * - Charter font (10pt for one-page fit)
 * - Clean section dividers
 * - Skills prominently displayed
 * - No colors (black text)
 * - ATS-optimized
 * - Optimized for single page
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

  // Limit bullets per job to ensure one-page fit
  const limitBullets = (bullets: string[], max: number = 4): string[] => {
    return bullets.slice(0, max)
  }

  // Categorize skills
  const categorizeSkills = (skills: string[]) => {
    const categories: { [key: string]: string[] } = {
      'Languages': [],
      'Frameworks': [],
      'Tools': [],
      'Other': []
    }

    const languageKeywords = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'r', 'matlab', 'scala', 'html', 'css']
    const frameworkKeywords = ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'next', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit', 'scipy', 'tailwind', 'bootstrap']
    const toolKeywords = ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'terraform', 'linux', 'mongodb', 'postgresql', 'redis', 'tableau', 'jupyter', 'colab', 'jira', 'figma']

    skills.forEach(skill => {
      const lower = skill.toLowerCase()
      if (languageKeywords.some(k => lower.includes(k))) {
        categories['Languages'].push(skill)
      } else if (frameworkKeywords.some(k => lower.includes(k))) {
        categories['Frameworks'].push(skill)
      } else if (toolKeywords.some(k => lower.includes(k))) {
        categories['Tools'].push(skill)
      } else {
        categories['Other'].push(skill)
      }
    })

    return categories
  }

  const skillCategories = categorizeSkills(resume.skills)

  // Build skills section with categories - limit each category
  const skillsSection = Object.entries(skillCategories)
    .filter(([, skills]) => skills.length > 0)
    .map(([category, skills]) => `    \\begin{onecolentry}
        \\textbf{${category}:} ${skills.slice(0, 8).map(s => escapeTex(s)).join(', ')}
    \\end{onecolentry}`)
    .join('\n    \\vspace{0.03cm}\n')

  // Limit experience entries (max 4 jobs)
  const limitedExperience = resume.experience.slice(0, 4)

  // Build experience section
  const experienceSection = limitedExperience.map(exp => `
    \\begin{twocolentry}{
        ${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}
    }
        \\textbf{${escapeTex(exp.title)}}, ${escapeTex(exp.company)}
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
        ${escapeTex(edu.degree)}${edu.gpa ? ` \\textbar{} GPA: ${escapeTex(edu.gpa)}` : ''}
    \\end{twocolentry}
`).join('\n\\vspace{0.08cm}\n')

  // Build projects section (max 2 projects)
  const limitedProjects = resume.projects?.slice(0, 2) || []
  const projectsSection = limitedProjects.length > 0
    ? limitedProjects.map(p => `
    \\begin{onecolentry}
        \\textbf{${escapeTex(p.name)}:} ${escapeTex(p.description).slice(0, 150)}${p.description.length > 150 ? '...' : ''}${p.technologies && p.technologies.length > 0 ? ` \\textbar{} \\textit{${p.technologies.slice(0, 5).map(t => escapeTex(t)).join(', ')}}` : ''}
    \\end{onecolentry}
`).join('\n\\vspace{0.05cm}\n')
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
\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\normalsize}{}{0pt}{}[\\vspace{1pt}\\titlerule]
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
        {\\fontsize{20pt}{20pt}\\selectfont\\bfseries ${escapeTex(resume.fullName)}}\\\\[0.2em]
        {\\footnotesize ${contactParts.join(' \\textbar{} ')}}
    \\end{center}

    \\vspace{0.15cm}

    % Education first for students
    \\section{Education}
${educationSection}

    % Technical Skills prominently
    \\section{Technical Skills}
${skillsSection}

    % Experience
    \\section{Experience}
${experienceSection}

${projectsSection ? `
    % Projects
    \\section{Projects}
${projectsSection}` : ''}

\\end{document}`
}
