const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractReceiptData = async (filePath, fileType) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Read file as base64
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');

    // Determine MIME type
    let mimeType = 'image/jpeg';
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.pdf') mimeType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.xlsx' || ext === '.xls') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const prompt = `You are an AI assistant that extracts expense data from receipts, invoices, and expense documents.

Analyze this ${fileType} and extract ALL expense line items you can find. Each line item should be a separate expense record.

For EACH expense found, extract:
1. Merchant/Vendor Name (restaurant, store, company name)
2. Amount (numerical value only, no currency symbols)
3. Currency (USD, EUR, INR, etc.)
4. Date (in YYYY-MM-DD format)
5. Category (Food, Travel, Accommodation, Transport, Office Supplies, Entertainment, Training, or General)
6. Description (brief description of the item/service)
7. Expense Type (Meal, Flight, Hotel, Taxi, etc.)

If this is a restaurant bill with multiple items, create separate expense records for each line item.
If this is a travel expense with flights + hotel, create separate records.
If this is an Excel/PDF with multiple expenses, extract each one.

Return ONLY a valid JSON array of expense objects. Format:
[
  {
    "merchantName": "Restaurant Name",
    "amount": 25.50,
    "currency": "USD",
    "date": "2024-10-04",
    "category": "Food",
    "description": "Lunch with client",
    "expenseType": "Meal"
  }
]

If you cannot extract certain fields, use these defaults:
- merchantName: "Unknown Merchant"
- currency: "USD"
- category: "General"
- date: today's date
- description: "Expense from receipt"

Return ONLY the JSON array, no other text.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let expenses = [];
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      expenses = JSON.parse(cleanedText);

      if (!Array.isArray(expenses)) {
        expenses = [expenses];
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      throw new Error('AI returned invalid format');
    }

    return {
      expenses: expenses,
      count: expenses.length,
      source: 'AI'
    };
  } catch (error) {
    console.error('Gemini AI processing error:', error);
    throw new Error('Failed to process document with AI: ' + error.message);
  }
};

module.exports = { extractReceiptData };
