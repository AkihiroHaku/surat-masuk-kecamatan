const { jsPDF } = require('jspdf');
const fs = require('fs');

const doc = new jsPDF();
doc.text('Nomor: 123/456\nTanggal: 2026-05-15\nPerihal: Undangan Rapat\nPengirim: Dinas Pendidikan', 10, 10);
const arr = doc.output('arraybuffer');
fs.writeFileSync('test.pdf', Buffer.from(arr));
console.log('created test.pdf');

const { PDFParse } = require("pdf-parse");

async function run() {
  const buffer = fs.readFileSync('test.pdf');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  console.log("PDF Text:", result.text);
}
run().catch(console.error);
