import {
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

import type { CvDocumentModel } from '../src/content/documents';

function contactParagraph(document: CvDocumentModel): Paragraph {
  const children: (TextRun | ExternalHyperlink)[] = [];

  for (const link of document.contact) {
    if (children.length > 0) {
      children.push(new TextRun(' · '));
    }

    children.push(
      new ExternalHyperlink({
        link: link.href,
        children: [
          new TextRun({ text: link.text, style: 'Hyperlink' }),
        ],
      }),
    );
  }

  if (document.phone) {
    if (children.length > 0) {
      children.push(new TextRun(' · '));
    }

    children.push(new TextRun(document.phone));
  }

  return new Paragraph({
    children,
    spacing: { after: 240 },
  });
}

/**
 * Builds the DOCX representation of a CV document from the same model the PDF
 * renderer uses. Every string in the model appears in both formats in the same
 * reading order.
 */
export async function renderCvDocx(
  document: CvDocumentModel,
): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      text: document.name,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: document.variantLabel, color: '444444', size: 24 }),
      ],
      spacing: { after: 120 },
    }),
    contactParagraph(document),
  ];

  for (const section of document.sections) {
    children.push(
      new Paragraph({
        text: section.heading,
        heading: HeadingLevel.HEADING_1,
      }),
    );

    for (const entry of section.entries) {
      children.push(
        new Paragraph({
          text: entry.company,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [new TextRun({ text: entry.title, bold: true })],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: entry.meta, color: '444444', italics: true }),
          ],
          spacing: { after: entry.concurrent ? 40 : 120 },
        }),
      );

      if (entry.concurrent) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: entry.concurrent,
                color: '444444',
                italics: true,
              }),
            ],
            spacing: { after: 120 },
          }),
        );
      }

      for (const bullet of entry.bullets) {
        children.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
            spacing: { after: 60 },
          }),
        );
      }
    }
  }

  const file = new Document({
    creator: document.name,
    title: `${document.name} — ${document.variantLabel}`,
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22 },
        },
      },
    },
    sections: [{ children }],
  });

  return Packer.toBuffer(file);
}
