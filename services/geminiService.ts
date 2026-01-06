
import { GoogleGenAI, Type } from "@google/genai";
import { BankStatementData, BankProvider, ChatMessage } from "../types";

/**
 * Generates bank-specific hints to guide the AI model's vision and parsing.
 */
const getBankSpecificHints = (bank: BankProvider): string => {
  switch (bank) {
    case 'CIMB':
      return `
        - CIMB specific: Look for headers like "Date / Tarikh", "Description / Diskripsi", "Withdrawal / Pengeluaran (RM)", "Deposits / Deposit (RM)", "Tax / Cukai (RM)", "Balance / Baki (RM)".
        - Note: CIMB often includes a "Tax" column for service taxes on specific transactions.
        - The table title is usually "Current Account Transaction Details / Butir-butir Transaksi Akaun Semasa".
      `;
    case 'Maybank':
      return `
        - Maybank specific: Look for columns like "Transaction Date", "Value Date", "Description", "Reference Number", "Debit", "Credit", "Balance".
        - Note: "Debit" corresponds to withdrawals, and "Credit" corresponds to deposits.
        - Sometimes description lines are split across multiple small rows; merge them into one.
      `;
    case 'RHB':
      return `
        - RHB specific: Look for "Trans Date", "Description", "Ref No.", "Withdrawal", "Deposit", "Running Balance".
        - Ensure multi-line descriptions for fund transfers (IBG/DuitNow) are concatenated.
      `;
    case 'Public Bank':
      return `
        - Public Bank specific: Headers are often "Date", "Transaction Description", "Reference", "Withdrawals", "Deposits", "Balance".
      `;
    case 'Hong Leong':
      return `
        - Hong Leong specific: Headers like "Date", "Transaction Description", "Ref No", "Debit/Withdrawal", "Credit/Deposit", "Balance".
      `;
    default:
      return `
        - Auto-detect: Identify the table structure based on common Malaysian banking terms like "Tarikh", "Diskripsi", "Debit", "Credit", "Baki", "RM".
      `;
  }
};

const SYSTEM_INSTRUCTION = (selectedBank: BankProvider) => `
You are a specialized Forensic Audit AI expert in parsing Malaysian bank statements.
Target Bank Context: ${selectedBank}.

Your goal is to extract structured financial data and perform intelligent audit categorization for tax planning.

General Extraction Rules:
1. Account Metadata:
   - Extract bank name, account name, and account number.
   - Extract the statement period/date range.
   - Extract opening and closing balances as numeric values.

2. Transactions & Audit Intelligence:
   - Dates: Convert to YYYY-MM-DD.
   - Year of Assessment: Group by the calendar year of the transaction (e.g., 2024-01-15 is YA 2024).
   - Audit Tags: Infer transaction type. 
     * "salary" if description contains "SALARY", "WAGES", "GAJI".
     * "epf_socso" if description contains "KWSP", "EPF", "SOCSO", "PERKESO".
     * "director_drawing" if description contains a director's name or "DIR DRAWING".
     * "tax_payment" if description contains "LHDN", "INCOME TAX", "STAMP DUTY".
     * "loan_repayment" if description contains "LOAN", "MORTGAGE", "HIRE PURCHASE".
   - Counterparty Type: Infer if it is a "government" body (LHDN, KWSP), "employee", "director", or "vendor".

3. Reconciliation Logic:
   - Sum all deposits (Credits).
   - Sum all withdrawals (Debits).
   - Verify: Opening Balance + Total Deposits - Total Withdrawals = Closing Balance.
   - Report any discrepancy in the 'reconciliation_info' object.

4. Output Requirements:
   - Return valid JSON matching the provided schema.
   - Ensure 'balance_after' is present for every row.
   - Handle multi-page statements (limit analysis to the provided images).
`;

export const extractStatementData = async (base64Images: string[], bank: BankProvider): Promise<BankStatementData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = base64Images.map(data => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: data,
    },
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          ...imageParts,
          { text: `Extract all transaction data, audit tags, and metadata from these ${bank} bank statement pages into a ledger-ready JSON object. Perform a reconciliation check on the balances.` }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION(bank),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          account_metadata: {
            type: Type.OBJECT,
            properties: {
              bank_name: { type: Type.STRING },
              account_name: { type: Type.STRING },
              account_number: { type: Type.STRING },
              statement_period: { type: Type.STRING },
              currency: { type: Type.STRING },
              opening_balance: { type: Type.NUMBER },
              closing_balance: { type: Type.NUMBER },
            },
            required: ["bank_name", "account_name", "account_number", "opening_balance", "closing_balance"],
          },
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                cheque_ref_no: { type: Type.STRING },
                withdrawal_amount: { type: Type.NUMBER },
                deposit_amount: { type: Type.NUMBER },
                tax_amount: { type: Type.NUMBER },
                balance_after: { type: Type.NUMBER },
                year_of_assessment: { type: Type.STRING },
                audit_tags: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["revenue", "expense", "salary", "epf_socso", "loan_repayment", "director_drawing", "tax_payment", "interbank_transfer", "other"] },
                    counterparty_type: { type: Type.STRING, enum: ["employee", "director", "vendor", "government", "related_company", "unknown"] },
                    notes: { type: Type.STRING },
                  },
                  required: ["type", "counterparty_type"]
                }
              },
              required: ["date", "description", "balance_after", "audit_tags", "year_of_assessment"],
            }
          },
          reconciliation_info: {
            type: Type.OBJECT,
            properties: {
              is_reconciled: { type: Type.BOOLEAN },
              calculated_movement: { type: Type.NUMBER },
              expected_movement: { type: Type.NUMBER },
              issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["is_reconciled", "calculated_movement", "expected_movement"]
          }
        }
      }
    },
  });

  const resultText = response.text;
  if (!resultText) throw new Error("AI returned empty response");
  
  try {
    return JSON.parse(resultText) as BankStatementData;
  } catch (e) {
    console.error("JSON Parse Error:", resultText);
    throw new Error("Failed to parse financial data from AI response.");
  }
};

/**
 * Chat bot for answering audit questions about the extracted data.
 */
export const askAuditAssistant = async (
  query: string, 
  history: ChatMessage[], 
  data?: BankStatementData
): Promise<ChatMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const needsSearch = /latest|news|market|current rate|verify|bank code|swift|malaysia|tax rate/i.test(query);
  const model = needsSearch ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
  
  const context = data ? `
    Statement Data Loaded. 
    Metadata: ${JSON.stringify(data.account_metadata)}. 
    Reconciliation: ${data.reconciliation_info.is_reconciled ? 'Verified' : 'Failed'}.
    Transactions Summary: ${data.transactions.length} rows.
  ` : "No statement data loaded yet.";
  
  const response = await ai.models.generateContent({
    model: model,
    contents: [
      { role: 'user', parts: [{ text: `System Context: ${context}` }] },
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction: "You are the Audit Assistant. You have access to extracted bank statement data with forensic audit tags. Help the user with tax calculations, transaction categorization, and reconciliation issues. Be very precise with numbers.",
      tools: needsSearch ? [{ googleSearch: {} }] : undefined,
    },
  });

  return {
    role: 'model',
    text: response.text || "I couldn't generate a response.",
    isSearch: needsSearch,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks as any
  };
};

/**
 * Fast AI response using gemini-2.5-flash-lite for simple tasks.
 */
export const quickResponse = async (query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: query,
    config: {
      maxOutputTokens: 200,
    }
  });
  return response.text || "";
};
