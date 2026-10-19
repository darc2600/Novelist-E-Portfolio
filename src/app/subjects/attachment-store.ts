import { Injectable } from '@angular/core';
import type { MemoryAttachment } from './models';
import { OnlinePortfolio } from './online-portfolio';

export async function validateAttachment(file: File): Promise<string> {
  if (file.size === 0 || file.size > 10 * 1024 * 1024) throw new Error('Choose a non-empty image or PDF up to 10 MB.');
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const starts = (...signature: number[]) => signature.every((n, i) => bytes[i] === n);
  let type = '';
  if (starts(0xff, 0xd8, 0xff) && /\.jpe?g$/i.test(file.name)) type = 'image/jpeg';
  if (starts(137, 80, 78, 71, 13, 10, 26, 10) && /\.png$/i.test(file.name)) type = 'image/png';
  if (new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP' && /\.webp$/i.test(file.name)) type = 'image/webp';
  if (new TextDecoder().decode(bytes).startsWith('%PDF-') && /\.pdf$/i.test(file.name)) type = 'application/pdf';
  if (!type || (file.type && file.type !== type)) throw new Error('Only valid JPG, PNG, WebP images and PDF files are supported.');
  return type;
}

@Injectable({ providedIn: 'root' })
export class AttachmentStore {
  private readonly online = new OnlinePortfolio();
  private async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('reflection-link-attachments', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('files');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Attachment storage is unavailable. Enable browser storage and try again.'));
      request.onblocked = () => reject(new Error('Close other archive tabs and try again.'));
    });
  }
  private async run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction('files', mode);
        const request = action(tx.objectStore('files'));
        tx.oncomplete = () => resolve(request.result);
        tx.onabort = () => reject(new Error('Attachment could not be stored. Browser storage may be full or unavailable.'));
        tx.onerror = () => reject(new Error('Attachment storage failed. Please try again.'));
      });
    } finally { db.close(); }
  }
  async add(file: File): Promise<MemoryAttachment> {
    const mimeType = await validateAttachment(file);
    const attachment = { id: crypto.randomUUID(), name: file.name, mimeType, size: file.size };
    const blob = new Blob([file], { type: mimeType });
    if (this.online.enabled) await this.online.upload(attachment.id, blob);
    else await this.run('readwrite', store => store.put(blob, attachment.id));
    return attachment;
  }
  async get(id: string): Promise<Blob | undefined> {
    if (this.online.enabled) return this.online.download(id);
    return this.run('readonly', store => store.get(id));
  }
  async remove(id: string): Promise<void> {
    if (this.online.enabled) return this.online.remove(id);
    await this.run('readwrite', store => store.delete(id));
  }
}
