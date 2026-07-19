import puppeteer from "puppeteer";
import { execSync } from "child_process";
import { logger } from "../../utils/logger.js";
import { ExternalServiceError } from "../../errors/index.js";
import { uploadBuffer } from "../../utils/storage.js";

export class PdfService {
  /**
   * Renders HTML content directly to a PDF Buffer using headless Chrome.
   * @param htmlContent HTML string to render
   */
  public async renderHtmlToPdf(htmlContent: string): Promise<Buffer> {
    logger.info("Executing direct HTML-to-PDF conversion using Puppeteer");
    let browser;
    try {
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || undefined;
      try {
        browser = await puppeteer.launch({
          headless: true,
          ...(executablePath ? { executablePath } : {}),
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--single-process",
            "--no-zygote"
          ]
        });
      } catch (launchErr: any) {
        if (launchErr?.message?.includes("Could not find Chrome")) {
          logger.warn("Chrome missing at runtime. Installing Chrome dynamically via npx...");
          execSync("npx -y puppeteer browsers install chrome", { stdio: "inherit" });
          browser = await puppeteer.launch({
            headless: true,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--single-process",
              "--no-zygote"
            ]
          });
        } else {
          throw launchErr;
        }
      }
      
      const page = await browser.newPage();
      
      // Set the content of the page
      await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
      
      // Generate A4 format PDF
      const pdfBuffer = Buffer.from(await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0.4in",
          right: "0.4in",
          bottom: "0.4in",
          left: "0.4in"
        }
      }));
      
      logger.info(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (error: any) {
      logger.error("Failed to generate PDF via Puppeteer", error);
      throw new ExternalServiceError(`Headless browser PDF rendering failed: ${error.message}`, error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generates a PDF from HTML and uploads it to Cloudinary.
   * @param htmlContent HTML string to render
   * @param filename Desired name of the file (for folders)
   */
  public async generateAndUploadPdf(htmlContent: string, filename: string): Promise<{ secureUrl: string; publicId: string }> {
    try {
      const pdfBuffer = await this.renderHtmlToPdf(htmlContent);
      logger.info(`Uploading generated PDF to Cloudinary under folder "resumes"`);
      
      const uploadResult = await uploadBuffer(pdfBuffer, "resumes", {
        resource_type: "raw",
        public_id: `${filename.replace(/\s+/g, "_")}_${Date.now()}.pdf`
      });
      
      return uploadResult;
    } catch (error: any) {
      logger.error("Failed to generate and upload PDF resume", error);
      throw error;
    }
  }
}
