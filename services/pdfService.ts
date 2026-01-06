
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
  // 1. Check if the library is available (CDN check)
  if (typeof pdfjsLib === 'undefined') {
    throw new Error("PDF processing library failed to load. Please check your internet connection or reload the page.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Ensure worker source is set correctly before every document load
    const PDFJS_VERSION = '3.11.174';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    const pdf = await loadingTask.promise.catch((err: any) => {
      if (err.name === 'PasswordException') {
        throw new Error("This PDF is password protected. Please upload an unprotected statement.");
      } else if (err.name === 'InvalidPDFException') {
        throw new Error("The file uploaded is not a valid PDF or is corrupted.");
      }
      throw err;
    });

    const images: string[] = [];

    // Extract metadata
    const metadataInfo = await pdf.getMetadata().catch(() => ({ info: {} }));
    const info = metadataInfo?.info || {};
    
    const metadata: PdfMetadata = {
      pageCount: pdf.numPages,
      author: info.Author || 'Unknown',
      creationDate: info.CreationDate ? new Date(info.CreationDate).toLocaleString() : 'N/A',
      fileName: file.name,
      fileSize: formatBytes(file.size)
    };

    // Limit to 3 pages for AI processing
    const pagesToProcess = Math.min(pdf.numPages, 3);

    for (let i = 1; i <= pagesToProcess; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error("Failed to create canvas context for page rendering.");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const base64Image = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        images.push(base64Image);
      } catch (pageErr) {
        console.error(`Error processing page ${i}:`, pageErr);
        // Continue to next page if one fails
      }
    }

    if (images.length === 0) {
      throw new Error("Failed to extract any readable pages from the PDF.");
    }

    return { images, metadata };
  } catch (err: any) {
    console.error("convertPdfToImages failure:", err);
    throw new Error(err.message || "An unexpected error occurred while processing the PDF.");
  }
};
