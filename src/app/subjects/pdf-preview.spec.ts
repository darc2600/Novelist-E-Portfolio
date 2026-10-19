import { TestBed } from '@angular/core/testing';
import { PdfLoader, PdfPreview } from './pdf-preview';

describe('Embedded PDF renderer', () => {
  afterEach(() => vi.restoreAllMocks());
  it('renders pages into a canvas, navigates, provides page text, and cleans up', async () => {
    const render = vi.fn().mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
    const getPage = vi.fn().mockImplementation((page: number) => Promise.resolve({
      getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
      render, getTextContent: async () => ({ items: [{ str: `Text on page ${page}`, hasEOL: true }] }),
    }));
    const destroy = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({ imports: [PdfPreview], providers: [{ provide: PdfLoader, useValue: {
      open: vi.fn().mockResolvedValue({ promise: Promise.resolve({ numPages: 2, getPage }), destroy }),
    } }] });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
    const fixture = TestBed.createComponent(PdfPreview);
    fixture.componentRef.setInput('blob', new Blob(['%PDF-1.7'], { type: 'application/pdf' }));
    fixture.componentRef.setInput('name', 'lesson.pdf');
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(render).toHaveBeenCalled();
    expect(el.textContent).toContain('Page 1 of 2');
    expect(el.textContent).toContain('Text on page 1');
    expect(el.querySelector('iframe')).toBeNull();
    const buttons = el.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true);
    buttons[1].click(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(getPage).toHaveBeenCalledWith(2);
    expect(el.textContent).toContain('Page 2 of 2');
    expect(el.textContent).toContain('Text on page 2');
    expect(buttons[1].disabled).toBe(true);
    fixture.destroy(); expect(destroy).toHaveBeenCalled();
  });
  it('shows a clear fallback when a PDF cannot be read', async () => {
    TestBed.configureTestingModule({ imports: [PdfPreview], providers: [{ provide: PdfLoader, useValue: {
      open: vi.fn().mockRejectedValue({ name: 'PasswordException' }),
    } }] });
    const fixture = TestBed.createComponent(PdfPreview);
    fixture.componentRef.setInput('blob', new Blob(['locked'], { type: 'application/pdf' }));
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('requires a password');
    expect(fixture.nativeElement.textContent).toContain('Open file or Download');
    fixture.destroy();
  });
});
