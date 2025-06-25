declare module 'pdf-parse-fork' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  interface PDFParseOptions {
    max?: number;
    version?: string;
  }

  function pdf(dataBuffer: Buffer, options?: PDFParseOptions): Promise<PDFData>;
  export default pdf;
}