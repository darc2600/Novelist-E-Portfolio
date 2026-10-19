import { Component, effect, inject, input, signal } from '@angular/core';
import { PdfPreview } from './pdf-preview';
import { AttachmentStore } from './attachment-store';
import type { MemoryAttachment } from './models';

@Component({
  selector: 'app-attachment-preview',
  imports: [PdfPreview],
  template: `
    @for (item of previews(); track item.attachment.id) {
      <section class="attachment">
        <strong>{{ item.attachment.name }}</strong>
        @if (item.error) { <p role="alert">{{ item.error }}</p> }
        @else if (!item.url) { <p role="status">Loading attachment…</p> }
        @else {
          @if (item.attachment.mimeType === 'application/pdf') {
            @if (item.blob) { <app-pdf-preview [blob]="item.blob" [name]="item.attachment.name" /> }
          } @else { <img [src]="item.url" [alt]="item.attachment.name" /> }
          <div><a [href]="item.url" target="_blank" rel="noopener noreferrer">Open file ↗</a>
          <a [href]="item.url" [download]="item.attachment.name">Download</a></div>
        }
      </section>
    }
  `,
  styles: [`:host{display:block;min-width:0}.attachment{margin:16px 0;padding:16px;border:1px solid #d8cfbf;border-radius:5px;overflow-wrap:anywhere}.attachment strong{display:block;margin-bottom:12px}img{display:block;max-width:100%;max-height:420px;object-fit:contain;margin:0 auto 12px}iframe{display:block;width:100%;height:420px;border:0;background:#fff}a{color:#173f35;margin-right:18px;font-size:13px}p{font-size:12px;line-height:1.5}@media(max-width:600px){iframe{height:320px}}`],
})
export class AttachmentPreview {
  readonly attachments = input<MemoryAttachment[]>([]);
  private readonly store = inject(AttachmentStore);
  readonly previews = signal<{ attachment: MemoryAttachment; url?: string; blob?: Blob; error?: string }[]>([]);
  constructor() {
    effect(onCleanup => {
      const attachments = this.attachments();
      let disposed = false;
      const urls: string[] = [];
      this.previews.set(attachments.map(attachment => ({ attachment })));
      for (const attachment of attachments) {
        this.store.get(attachment.id).then(blob => {
          if (disposed) return;
          if (!blob || blob.type !== attachment.mimeType || !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) throw new Error();
          const url = URL.createObjectURL(blob);
          urls.push(url);
          this.previews.update(items => items.map(item => item.attachment.id === attachment.id ? {
            attachment, url, blob,
          } : item));
        }).catch(() => {
          if (!disposed) this.previews.update(items => items.map(item => item.attachment.id === attachment.id ? { attachment, error: 'This attachment is unavailable in this browser. Please upload it again.' } : item));
        });
      }
      onCleanup(() => { disposed = true; urls.forEach(url => URL.revokeObjectURL(url)); });
    });
  }
}
