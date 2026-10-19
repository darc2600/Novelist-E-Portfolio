import { Component, ElementRef, Injectable, PendingTasks, effect, inject, input, signal, viewChild } from '@angular/core';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

@Injectable({ providedIn: 'root' })
export class PdfLoader {
  async open(blob: Blob): Promise<PDFDocumentLoadingTask> {
    // Lazy loading keeps PDF.js out of the initial story bundle and SSR execution.
    const pdf = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const base = new URL('pdfjs/', document.baseURI);
    pdf.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', base).href;
    return pdf.getDocument({
      data: new Uint8Array(await blob.arrayBuffer()),
      cMapUrl: new URL('cmaps/', base).href, cMapPacked: true,
      standardFontDataUrl: new URL('standard_fonts/', base).href,
      wasmUrl: new URL('wasm/', base).href,
      isEvalSupported: false,
    });
  }
}

@Component({
  selector: 'app-pdf-preview',
  template: `
    <div class="pdf-toolbar" aria-label="PDF page navigation">
      <button type="button" (click)="page.set(page() - 1)" [disabled]="busy() || page() <= 1 || !document()">Previous</button>
      <span aria-live="polite">Page {{ page() }} of {{ document()?.numPages ?? '…' }}</span>
      <button type="button" (click)="page.set(page() + 1)" [disabled]="busy() || !document() || page() >= (document()?.numPages ?? 0)">Next</button>
    </div>
    @if (error()) { <p role="alert">{{ error() }} Use Open file or Download below.</p> }
    @else if (busy()) { <p role="status">Rendering PDF…</p> }
    <div class="pdf-page" [attr.aria-busy]="busy()">
      <canvas #canvas [hidden]="!!error()" role="img" [attr.aria-label]="name() + ', page ' + page()"></canvas>
    </div>
    @if (text()) { <details><summary>Read page text</summary><p class="page-text">{{ text() }}</p></details> }
  `,
  styles: [`:host{display:block;min-width:0}.pdf-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;font-size:12px}button{font:inherit;min-height:36px;padding:6px 12px;border:1px solid #d8cfbf;background:#173f35;color:#fffdf8;border-radius:4px;cursor:pointer}button:disabled{opacity:.45;cursor:default}button:focus-visible,summary:focus-visible{outline:2px solid #d65a24;outline-offset:3px}.pdf-page{max-height:65dvh;overflow:auto;background:#e8dfd0}canvas{display:block;width:100%;height:auto;background:white}p{font-size:12px;line-height:1.6}.page-text{white-space:pre-wrap}details{margin:12px 0;font-size:12px}`],
})
export class PdfPreview {
  readonly blob = input.required<Blob>();
  readonly name = input('PDF document');
  private readonly loader = inject(PdfLoader);
  private readonly pendingTasks = inject(PendingTasks);
  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly document = signal<PDFDocumentProxy | undefined>(undefined);
  readonly page = signal(1);
  readonly busy = signal(true);
  readonly error = signal('');
  readonly text = signal('');
  constructor() {
    effect(onCleanup => {
      const blob = this.blob();
      let disposed = false;
      let task: PDFDocumentLoadingTask | undefined;
      this.document.set(undefined); this.page.set(1); this.busy.set(true); this.error.set(''); this.text.set('');
      void this.pendingTasks.run(() => this.loader.open(blob).then(async loading => {
        task = loading;
        if (disposed) { await loading.destroy(); return; }
        const doc = await loading.promise;
        if (!disposed) this.document.set(doc);
      }).catch(error => {
        if (!disposed) {
          this.error.set(error?.name === 'PasswordException' ? 'This PDF requires a password.' : 'This PDF could not be previewed.');
          this.busy.set(false);
        }
      }));
      onCleanup(() => { disposed = true; void task?.destroy().catch(() => {}); });
    });
    effect(onCleanup => {
      const doc = this.document();
      const pageNumber = this.page();
      const canvas = this.canvas()?.nativeElement;
      if (!doc || !canvas) return;
      let disposed = false;
      let rendering: RenderTask | undefined;
      this.busy.set(true); this.error.set(''); this.text.set('');
      void this.pendingTasks.run(() => doc.getPage(pageNumber).then(async pdfPage => {
        if (disposed) return;
        const initial = pdfPage.getViewport({ scale: 1 });
        const width = Math.min(canvas.parentElement?.clientWidth || 800, 1200);
        let scale = width / initial.width * Math.min(window.devicePixelRatio || 1, 2);
        scale = Math.min(scale, Math.sqrt(4_000_000 / (initial.width * initial.height)));
        const viewport = pdfPage.getViewport({ scale });
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        rendering = pdfPage.render({ canvas, canvasContext: context, viewport });
        await rendering.promise;
        if (!disposed) this.busy.set(false);
        const content = await pdfPage.getTextContent();
        if (!disposed) this.text.set(content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join(''));
      }).catch(() => {
        if (!disposed) { this.error.set('This page could not be previewed.'); this.busy.set(false); }
      }));
      onCleanup(() => { disposed = true; rendering?.cancel(); });
    });
  }
}
