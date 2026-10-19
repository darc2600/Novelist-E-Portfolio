import { validateAttachment } from './attachment-store';

function file(name: string, type: string, bytes: number[], size = bytes.length): File {
  return { name, type, size, slice: () => ({ arrayBuffer: async () => new Uint8Array(bytes).buffer }) } as unknown as File;
}
describe('Memory attachment validation', () => {
  it('accepts actual image signatures and PDF headers with matching names and MIME types', async () => {
    expect(await validateAttachment(file('picture.png', 'image/png', [137,80,78,71,13,10,26,10]))).toBe('image/png');
    expect(await validateAttachment(file('picture.jpg', 'image/jpeg', [255,216,255]))).toBe('image/jpeg');
    expect(await validateAttachment(file('lesson.pdf', 'application/pdf', Array.from(new TextEncoder().encode('%PDF-1.7\n'))))).toBe('application/pdf');
  });
  it('rejects renamed HTML, unsupported file types, empty files, and oversized files', async () => {
    await expect(validateAttachment(file('fake.pdf', 'application/pdf', [60,104,116,109,108]))).rejects.toThrow('valid');
    await expect(validateAttachment(file('vector.svg', 'image/svg+xml', [60,115,118,103]))).rejects.toThrow('valid');
    await expect(validateAttachment(file('empty.pdf', 'application/pdf', [], 0))).rejects.toThrow('non-empty');
    await expect(validateAttachment(file('large.pdf', 'application/pdf', [37,80,68,70,45], 10*1024*1024+1))).rejects.toThrow('10 MB');
  });
});
