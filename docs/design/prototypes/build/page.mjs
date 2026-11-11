// The document shell every prototype page shares.
export function page({ title, stylesheet = 'style.css', body }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="${stylesheet}" />
  </head>
  <body>
${body}
  </body>
</html>
`;
}
