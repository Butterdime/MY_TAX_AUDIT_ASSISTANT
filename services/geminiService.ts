
import { GoogleGenAI, Type } from "@google/genai";
import { BankStatementData, BankProvider, ChatMessage, BusinessProfile } from "../types";

const EXTRACTION_SYSTEM_INSTRUCTION = (selectedBank: BankProvider, profile: BusinessProfile) => `
You are a specialized Forensic Audit AI expert in parsing Malaysian bank statements.
Target Bank Context: ${selectedBank}.

Business Profile Context:
- Legal Name: ${profile.legal_name}
- Business Type: ${profile.business_type}
- Registration No: ${profile.registration_number}
- TIN: ${profile.tax_identification_number}
- Financial Year End: ${profile.financial_year_end}

Your goal is to extract structured financial data and perform intelligent audit categorization for tax planning.

Contextual Guidance based on Business Type:
1. For 'sole_proprietorship' and 'partnership': 
   - Business income is taxed at the individual/partner level. 
   - Label money taken by the owner as "director_drawing" but note it's an owner drawing in the notes.
2. For 'sdn_bhd', 'bhd', and 'llp': 
   - Treat as separate legal entities.
   - categorize director payments with strict precision. Use the 'director_drawing' tag for loan repayments to directors or dividends/drawings.

Year of Assessment (YA) Logic:
- Group transactions by the calendar year they occur in (Standard Malaysian YA).
- If the statement spans the Financial Year End (${profile.financial_year_end}), ensure the transactions are attributed to the correct calendar-year YA for income tax filing.

Reconciliation:
- Ensure Opening Balance + Sum(Deposits) - Sum(Withdrawals) = Closing Balance.

Output Requirements:
- Return valid JSON matching the schema.
- Echo the Business Profile in 'business_profile_snapshot'.
`;

const CHAT_SYSTEM_INSTRUCTION = `
You are part of the AuditExtract application, an AI assistant specialized in Malaysian banking, audit, and tax workflows.
AuditExtract exposes two expert personas:

1. Mr RP – Tax Planning & Malaysian Income Tax
   Role: Senior Malaysian tax planner.
   Scope: Malaysian income tax concepts, Year of Assessment (YA), allowable/disallowable expenses, withholding tax, SST, and LHDN processes. Interpreting ledger data based on the entity's Business Type (Sole Prop, Sdn Bhd, etc.).

2. The Aoutha – Audit & Forensic Review
   Role: Senior audit manager focused on cash and bank, forensic consistency, and documentation.
   Scope: Reviewing extracted bank-ledger data for completeness, reconciliation issues, and unusual patterns.

Routing & Persona Selection:
- If mainly about tax, YA, LHDN, deductions, rates, or planning -> Respond as Mr RP.
- If mainly about audit, reconciliation, controls, completeness, or forensic checks -> Respond as The Aoutha.
`;

export const extractStatementData = async (base64Images: string[], bank: BankProvider, profile: BusinessProfile): Promise<BankStatementData> => {
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
          { text: `Extract all transaction data, audit tags, and metadata from these ${bank} bank statement pages into a ledger-ready JSON object for the entity ${profile.legal_name}. Perform a reconciliation check.` }
        ]
      }
    ],
    config: {
      systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION(bank, profile),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          business_profile_snapshot: {
            type: Type.OBJECT,
            properties: {
              legal_name: { type: Type.STRING },
              registration_number: { type: Type.STRING },
              business_type: { type: Type.STRING },
              tax_identification_number: { type: Type.STRING },
              financial_year_end: { type: Type.STRING },
            },
            required: ["legal_name", "registration_number", "business_type", "tax_identification_number", "financial_year_end"]
          },
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
              earliest_transaction_date: { type: Type.STRING, description: "ISO YYYY-MM-DD" },
              latest_transaction_date: { type: Type.STRING, description: "ISO YYYY-MM-DD" },
            },
            required: ["bank_name", "account_name", "account_number", "opening_balance", "closing_balance", "earliest_transaction_date", "latest_transaction_date"],
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

export const askAuditAssistant = async (
  query: string, 
  history: ChatMessage[], 
  data?: BankStatementData,
  profile?: BusinessProfile
): Promise<ChatMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const needsSearch = /latest|news|market|current rate|verify|bank code|swift|malaysia|tax rate|SST|LHDN/i.test(query);
  const model = needsSearch ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
  
  const context = data ? `
    Business: ${data.business_profile_snapshot.legal_name} (${data.business_profile_snapshot.business_type}).
    FYE: ${data.business_profile_snapshot.financial_year_end}.
    Statement Data Loaded. 
    Account: ${data.account_metadata.account_name} (${data.account_metadata.bank_name}).
    Reconciliation: ${data.reconciliation_info.is_reconciled ? 'Verified' : 'Failed'}.
    Transactions Summary: ${data.transactions.length} rows.
  ` : (profile ? `Initial Context: Business ${profile.legal_name} (${profile.business_type}). No statement yet.` : "No context loaded.");
  
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
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
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

export const quickResponse = async (query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    // Use the correct model name for flash lite as per guidelines
    model: 'gemini-flash-lite-latest',
    contents: query,
    // Fix: Removed maxOutputTokens to follow guidelines and prevent truncation unless explicitly needed
  });
  return response.text || "";
};
