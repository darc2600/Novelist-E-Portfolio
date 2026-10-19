import { TestBed } from '@angular/core/testing';
import { AttachmentPreview } from './attachment-preview';
import { AttachmentStore } from './attachment-store';
import { PdfLoader } from './pdf-preview';

describe('Memory attachment preview', () => {
  afterEach(() => vi.restoreAllMocks());
  it('previews local images and PDFs and releases their temporary URLs', async () => {
    const get = vi.fn().mockImplementation((id: string) => Promise.resolve(new Blob(['file'], { type: id === 'pdf' ? 'application/pdf' : 'image/png' })));
    TestBed.configureTestingModule({ imports: [AttachmentPreview], providers: [
      { provide: AttachmentStore, useValue: { get } },
      { provide: PdfLoader, useValue: { open: vi.fn().mockRejectedValue(new Error('Test document')) } },
    ] });
    vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:local-picture').mockReturnValueOnce('blob:local-pdf');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const fixture = TestBed.createComponent(AttachmentPreview);
    fixture.componentRef.setInput('attachments', [
      { id: 'image', name: 'picture.png', mimeType: 'image/png', size: 4 },
      { id: 'pdf', name: 'lesson.pdf', mimeType: 'application/pdf', size: 4 },
    ]);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img')?.getAttribute('src')).toBe('blob:local-picture');
    expect(el.querySelector('app-pdf-preview')).toBeTruthy();
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.querySelectorAll('a[download]')).toHaveLength(2);
    fixture.destroy();
    expect(revoke).toHaveBeenCalledWith('blob:local-picture');
    expect(revoke).toHaveBeenCalledWith('blob:local-pdf');
  });
});
