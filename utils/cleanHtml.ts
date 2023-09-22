export const cleanHtml = (html: string) => {
  if (!html) {
    return ''
  }
  return (
    html
      ?.replace(/^```[a-zA-Z0-9]*\n/i, '')
      .replace(/\n```$/, '')
      .split(/\n/g)
      .join('\n    ') || ''
  )
}
