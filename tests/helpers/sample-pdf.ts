export function buildSamplePdf(lines: readonly string[] = ['Hello PDF.js'], pageCount = 1): Uint8Array {
  const objects: string[] = [];
  const pageIds: string[] = [];
  const kids: string[] = [];

  for (let index = 0; index < pageCount; index += 1) {
    const pageId = 3 + index;
    const contentId = pageId + pageCount;
    pageIds.push(String(pageId));
    kids.push(`${pageId} 0 R`);
    const stream = lines
      .map((line, lineIndex) => {
        const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
        return `BT /F1 20 Tf 72 ${720 - lineIndex * 28} Td (${escaped}) Tj ET`;
      })
      .join('\n');
    const streamBytes = new TextEncoder().encode(stream).length;
    objects.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentId} 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  }

  const catalog = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const pages = `2 0 obj\n<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pageCount} >>\nendobj\n`;
  const font = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const header = '%PDF-1.4\n';
  const allObjects = [catalog, pages, ...objects, font];
  const offsets: number[] = [];
  let cursor = header.length;
  for (const object of allObjects) {
    offsets.push(cursor);
    cursor += object.length;
  }
  const xrefOffset = cursor;
  let xref = `xref\n0 ${allObjects.length + 1}\n0000000000 65535 f \n`;
  for (const objectOffset of offsets) {
    xref += `${String(objectOffset).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${allObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new TextEncoder().encode(header + allObjects.join('') + xref);
}
