"use client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.js";
import "react-pdf/dist/Page/TextLayer.js";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Outline } from "react-pdf";
const { Document, Page, pdfjs } = await import("react-pdf");

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfView = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<Blob | null>(null);
  const [rotation, setRotation] = useState<number>();
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const fetchFile = async () => {
      const response = await fetch(url);

      const file = await response.blob();

      setFile(file);
    };

    fetchFile();
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  };
  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        <div>
          <Button
            variant="outline"
            disabled={pageNumber === 1}
            onClick={() => {
              if (pageNumber > 1) {
                setPageNumber(pageNumber - 1);
              }
            }}
          >
            Previous
          </Button>
          <p className="flex items-center justify-center">
            {pageNumber} of {numPages}
          </p>
          <Button
            variant="outline"
            disabled={pageNumber === numPages}
            onClick={() => {
              if (pageNumber > 1) {
                setPageNumber(pageNumber + 1);
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
      {!file ? (
        <div>
          <Loader2Icon className="animate-spin mt-20" />
        </div>
      ) : (
        <Document
          loading={null}
          file={file}
          rotate={rotation}
          onLoadSuccess={onDocumentLoadSuccess}
          className="m-4 overflow-scroll"
        >
          <Page className="shadow-lg" scale={scale} pageNumber={pageNumber} />
        </Document>
      )}
    </div>
  );
};

export default PdfView;
