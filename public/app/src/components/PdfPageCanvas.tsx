import { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

type Props = {
  url: string;
  page: number;
  zoom?: number;
  onDocumentReady?: (pages: number) => void;
};

let cachedUrl = '';
let cachedDocument: PDFDocumentProxy | null = null;

export default function PdfPageCanvas({ url, page, zoom = 1, onDocumentReady }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(cachedUrl === url ? cachedDocument : null);
  const [width, setWidth] = useState(760);
  const [status, setStatus] = useState('Carregando página...');

  useEffect(() => {
    let active = true;
    if (cachedUrl === url && cachedDocument) {
      setDocument(cachedDocument);
      onDocumentReady?.(cachedDocument.numPages);
      return () => { active = false; };
    }
    setStatus('Abrindo a edição completa...');
    getDocument(url).promise
      .then((pdf) => {
        if (!active) return;
        cachedUrl = url;
        cachedDocument = pdf;
        setDocument(pdf);
        onDocumentReady?.(pdf.numPages);
      })
      .catch(() => active && setStatus('Não foi possível carregar esta página.'));
    return () => { active = false; };
  }, [url, onDocumentReady]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.min(980, entry.contentRect.width)));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!document || !canvasRef.current) return;
    let active = true;
    setStatus('Carregando página...');
    renderTaskRef.current?.cancel();
    document.getPage(page).then((pdfPage) => {
      if (!active || !canvasRef.current) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const cssScale = width / base.width;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = pdfPage.getViewport({ scale: cssScale * pixelRatio * zoom });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
      canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;
      const task = pdfPage.render({ canvasContext: context, viewport });
      renderTaskRef.current = task;
      task.promise.then(() => active && setStatus('')).catch((error) => {
        if (error?.name !== 'RenderingCancelledException' && active) setStatus('Não foi possível renderizar esta página.');
      });
    });
    return () => {
      active = false;
      renderTaskRef.current?.cancel();
    };
  }, [document, page, width, zoom]);

  return (
    <div className="pdf-page-host" ref={hostRef}>
      {status && <div className="pdf-page-status">{status}</div>}
      <canvas ref={canvasRef} aria-label={`Página ${page} do livro`} />
    </div>
  );
}
