import { ParsedResume } from '@/types/templates'

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
  }

  // Group skills by category (basic heuristic)
  const categorizeSkills = (skills: string[]) => {
    const categories: { [key: string]: string[] } = {
      'Languages': [],
      'Frameworks': [],
      'Tools & Platforms': [],
      'Other': []
    }

    const languageKeywords = ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'html', 'css']
    const frameworkKeywords = ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'next', 'nuxt', 'svelte', 'rails', 'laravel', '.net']
    const toolKeywords = ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'terraform', 'linux', 'mongodb', 'postgresql', 'redis', 'graphql']

    skills.forEach(skill => {
      const lower = skill.toLowerCase()
      if (languageKeywords.some(k => lower.includes(k))) {
        categories['Languages'].push(skill)
      } else if (frameworkKeywords.some(k => lower.includes(k))) {
        categories['Frameworks'].push(skill)
      } else if (toolKeywords.some(k => lower.includes(k))) {
        categories['Tools & Platforms'].push(skill)
      } else {
        categories['Other'].push(skill)
      }
    })

    return categories
  }

  const skillCategories = categorizeSkills(resume.skills)

  const experienceSection = resume.experience.map(exp => `
\\subsection*{${escapeTex(exp.title)} | ${escapeTex(exp.company)}}
\\textit{${escapeTex(exp.startDate)} -- ${escapeTex(exp.endDate)}}${exp.location ? ` | ${escapeTex(exp.location)}` : ''}
\\begin{itemize}[leftmargin=1em,topsep=0.2em,itemsep=0.1em,parsep=0em]
${exp.bullets.map(b => `  \\item ${escapeTex(b)}`).join('\n')}
\\end{itemize}
`).join('\n')

  const educationSection = resume.education.map(edu => `
\\textbf{${escapeTex(edu.degree)}} -- ${escapeTex(edu.school)} \\hfill ${escapeTex(edu.graduationDate)}
${edu.gpa ? ` | GPA: ${escapeTex(edu.gpa)}` : ''}
`).join('\n')

  const skillsSection = Object.entries(skillCategories)
    .filter(([_, skills]) => skills.length > 0)
    .map(([category, skills]) => `\\textbf{${category}:} ${skills.map(s => escapeTex(s)).join(', ')}`)
    .join('\\\\\n')

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{fontawesome5}

% Colors
\\definecolor{accent}{RGB}{37, 99, 235}
\\definecolor{lightgray}{RGB}{243, 244, 246}

% Remove page numbers
\\pagenumbering{gobble}

% Section formatting
\\usepackage{titlesec}
\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0em}{\\faIcon{code}\\hspace{0.5em}}[\\titlerule]
\\titlespacing{\\section}{0pt}{0.8em}{0.4em}
\\titleformat{\\subsection}[runin]{\\bfseries}{}{0em}{}

% Compact lists
\\setlist{nolistsep}

% No paragraph indent
\\setlength{\\parindent}{0pt}

\\begin{document}

% Header
\\begin{center}
{\\Huge\\bfseries ${escapeTex(resume.fullName)}}\\\\[0.3em]
{\\color{accent}\\large Software Engineer}\\\\[0.5em]
${[
  resume.email ? `\\faIcon{envelope} \\href{mailto:${resume.email}}{${escapeTex(resume.email)}}` : '',
  resume.phone ? `\\faIcon{phone} ${escapeTex(resume.phone)}` : '',
  resume.linkedin ? `\\faIcon{linkedin} \\href{${resume.linkedin}}{LinkedIn}` : '',
  resume.location ? `\\faIcon{map-marker-alt} ${escapeTex(resume.location)}` : ''
].filter(Boolean).join(' \\quad ')}
\\end{center}

\\vspace{0.5em}

% Skills Box - prominent at top
\\colorbox{lightgray}{
\\begin{minipage}{\\dimexpr\\textwidth-2\\fboxsep}
\\section*{\\faIcon{laptop-code} Technical Skills}
${skillsSection}
\\end{minipage}
}

\\vspace{0.5em}

${resume.summary ? `
\\section*{\\faIcon{user} Summary}
${escapeTex(resume.summary)}
` : ''}

\\section*{\\faIcon{briefcase} Experience}
${experienceSection}

\\section*{\\faIcon{graduation-cap} Education}
${educationSection}

${resume.projects?.length ? `
\\section*{\\faIcon{project-diagram} Projects}
${resume.projects.map(p => `
\\textbf{${escapeTex(p.name)}}${p.link ? ` -- \\href{${p.link}}{\\faIcon{link}}` : ''}\\\\
${escapeTex(p.description)}
${p.technologies?.length ? `\\\\\\textit{Tech: ${p.technologies.map(t => escapeTex(t)).join(', ')}}` : ''}
`).join('\n\\vspace{0.3em}\n')}
` : ''}

\\end{document}`
}
