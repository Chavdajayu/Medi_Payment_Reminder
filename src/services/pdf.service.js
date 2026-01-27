const fs = require('fs');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');

async function parseFile(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    return await parsePDF(filePath);
  } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
    return parseExcel(filePath);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const text = data.text;

  const invoiceNumber = text.match(/Invoice\s*(?:#|No\.?|Number)[\s:]*([A-Za-z0-9-]+)/i)?.[1] || "Unknown";
  const amount = text.match(/Total[\s:]*([\d,.]+)/i)?.[1]?.replace(/,/g, '') || "0";
  const buyerName = text.match(/Buyer[\s:]*([^\n]+)/i)?.[1]?.trim() || "Unknown Buyer";
  const phoneNumber = text.match(/Phone[\s:]*([\d+-\s]+)/i)?.[1]?.trim() || "";
  const dueDate = text.match(/Due\s*Date[\s:]*([\d/-]+)/i)?.[1] || new Date().toISOString().split('T')[0];

  return [{
    invoiceNumber,
    amount: parseFloat(amount),
    buyerName,
    phoneNumber,
    dueDate,
    status: 'unpaid'
  }];
}

function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet);

  return json.map(row => {
    const keys = Object.keys(row);
    const getVal = (pattern) => {
        const key = keys.find(k => k.toLowerCase().includes(pattern));
        return key ? row[key] : null;
    };

    return {
      invoiceNumber: getVal('invoice') || "Unknown",
      amount: parseFloat(getVal('total') || getVal('amount') || "0"),
      buyerName: getVal('buyer') || getVal('name') || "Unknown Buyer",
      phoneNumber: getVal('phone') || getVal('mobile') || "",
      dueDate: getVal('due') || new Date().toISOString().split('T')[0],
      status: 'unpaid'
    };
  });
}

module.exports = { parseFile };
