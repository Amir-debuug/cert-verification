/* eslint-disable @typescript-eslint/no-explicit-any */
import {AES, enc} from 'crypto-js';
import * as fs from 'fs';
import {PDFDocument, PDFPage} from 'pdf-lib';
import pdfParser from 'pdf-parse';
import {fromBuffer} from 'pdf2pic';
import QRCode from 'qrcode';
import {AppConstants} from '../../keys';

const cropSize = 60;

export class PdfUtility {
  generateHash(inputString: string): string {
    return AES.encrypt(inputString, AppConstants.QR_SECRET).toString();
  }

  decodeHash(stringToDecode: string): string {
    return AES.decrypt(stringToDecode, AppConstants.QR_SECRET).toString(
      enc.Utf8,
    );
  }

  async modifyDocument(filecontent: string, qrHash: string): Promise<string> {
    try {
      const pdfBytes = Buffer.from(filecontent, 'base64');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      // add QR hash to metadata
      pdfDoc.setCreator(qrHash);
      const qrBuffer: Buffer = await QRCode.toBuffer(qrHash, {
        color: {
          dark: '#40515e',
        },
      });
      const firstPage = pdfDoc.getPages()[0];
      const {width, height} = firstPage.getSize();

      return pdfParser(pdfBytes).then(function (data: any) {
        return new PdfUtility().checkPage(
          qrBuffer,
          pdfDoc,
          width,
          height,
          data.text,
        );
      });
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async addQR(
    page: PDFPage,
    buffer: Buffer,
    pdfDoc: PDFDocument,
    width: number,
    height: number,
  ) {
    try {
      page.setBleedBox(0, 0, width / 2, height / 2);
      page.setMediaBox(0, -cropSize, width, height + cropSize);
      const pngImage = await pdfDoc.embedPng(buffer);
      page.drawImage(pngImage, {
        x: width - 80,
        y: -50,
        width: 60,
        height: 60,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async checkPage(
    buffer: Buffer,
    pdfDoc: PDFDocument,
    width: number,
    height: number,
    data: string,
  ): Promise<string> {
   
    for (let index = 0; index < pdfDoc.getPageCount(); index++) {
      await this.addQR(pdfDoc.getPage(index), buffer, pdfDoc, width, height);
    }

    const newPdfBytes = await pdfDoc.save();
    const Readable = require('stream').Readable;
    const stream = new Readable();
    stream.push(newPdfBytes);
    stream.push(null);
    return stream;
  }

  async getVerificationHashFromContent(fileContent: string): Promise<string> {
    try {
      const pdfBytes = Buffer.from(fileContent, 'base64');
      return await this.getVerificationHash(pdfBytes);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
  async getVerificationHash(fileContent: Buffer): Promise<string> {
    try {
      const pdfDoc: PDFDocument = await PDFDocument.load(fileContent);
      return pdfDoc.getCreator();
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async getJpeg(contentBuffer: Buffer): Promise<Buffer> {
    try {
      const fileName = 'pdf-' + Date.now();
      const options = {
        density: 300,
        saveFilename: fileName,
        savePath: '/tmp',
        format: 'jpg',
        width: 800,
        height: 1035,
      };

      const filePath = `/tmp/${fileName}.1.jpg`;
      const convert = fromBuffer(contentBuffer, options);
      await convert(1, false);
      const buffer: Buffer = fs.readFileSync(filePath);

      fs.unlinkSync(filePath);

      return buffer;
    } catch (error) {
      console.log('Error: ' + error);
      return undefined;
    }
  }
}
