
import { PdfMetadata } from "../types";

declare const pdfjsLib: any;

export interface PdfProcessingResult {
  images: string[];
  metadata: PdfMetadata;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const convertPdfToImages = async (file: File): Promise<PdfProcessingResult> => {
  const arrayBuffer = await file.arrayBuffer();
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  // Extract metadata
  const metadataInfo = await pdf.getMetadata();
  const info = metadataInfo?.info || {};
  
  const metadata: PdfMetadata = {
    pageCount: pdf.numPages,
    author: info.Author || 'Unknown',
    creationDate: info.CreationDate ? new Date(info.CreationDate).toLocaleString() : 'N/A',
    fileName: file.name,
    fileSize: formatBytes(file.size)
  };

  // Limit to 3 pages for AI processing as per requirement, but keep track of actual page count in metadata
  const pagesToProcess = Math.min(pdf.numPages, 3);

  for (let i = 1; i <= pagesToProcess; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    images.push(base64Image);
  }

  return { images, metadata };
};
