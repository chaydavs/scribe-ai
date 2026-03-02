/**
 * Escape LaTeX special characters and convert markdown-style formatting.
 * **bold** → \textbf{bold}
 * *italic* → \textit{italic}
 */
export function escapeLatex(str: string): string {
  if (!str) return ''
  let result = str
    .replace(/\\/g, '\x00BACKSLASH\x00')
    .replace(/[&%$#_{}]/g, m => '\\' + m)
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\|/g, '\\textbar{}')
    .replace(/\x00BACKSLASH\x00/g, '\\textbackslash{}')

  // Convert **bold** to \textbf{bold} (must come before single *)
  result = result.replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}')
  // Convert *italic* to \textit{italic}
  result = result.replace(/\*(.+?)\*/g, '\\textit{$1}')

  return result
}
