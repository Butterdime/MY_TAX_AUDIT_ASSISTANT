
import { GoogleGenAI, Type } from "@google/genai";
import { BankStatementData, BankProvider, ChatMessage, BusinessProfile, SupportedLanguage, AssistantPersona } from "../types";

const EXTRACTION_SYSTEM_INSTRUCTION = (selectedBank: BankProvider, lang: SupportedLanguage) => `
You are MYAUDIT, a specialized Forensic Audit AI expert. 
Output Language: ${lang === 'ms' ? 'Bahasa Malaysia' : lang === 'zh' ? 'Chinese' : 'English'}.
Target Bank Context: ${selectedBank}.

Your goal is to perform a "Zero-Input" extraction. You must extract structured financial data for tax planning from Malaysian bank statements.

CRITICAL INSTRUCTIONS:
1. **Business Profile Extraction**: You MUST identify the Legal Entity Name, Registration Number (SSM), and Tax ID (TIN) directly from the bank statement headers or the "Account Name" section. 
2. **Business Type Inference**: Determine if the entity is a 'sdn_bhd', 'sole_proprietorship', etc., based on the name (e.g., contains "Sdn Bhd", "Enterprise", "Trading").
3. **FYE Inference**: Infer the Financial Year End (FYE). If not obvious, use '31-12' as the Malaysian default.
4. **Transactions**: Extract every transaction with a date, description, and amount.
5. **Audit Tagging**: Categorize each transaction into audit types (Salary, Revenue, Tax Payment, etc.).
6. All generated labels and notes must be in ${lang}.
7. Return ONLY valid JSON that matches the schema provided. Do not include any conversational text or markdown blocks outside the JSON.
`;

export const extractStatementData = async (base64Images: string[], bank: BankProvider, lang: SupportedLanguage): Promise<BankStatementData> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is missing. Please contact support or check environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageParts = base64Images.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ 
        parts: [
          ...imageParts, 
          { text: `Perform a full forensic extraction and auto-detect the business profile details. Return JSON. Language preference: ${lang}.` }
        ] 
      }],
      config: {
        systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION(bank, lang),
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
                financial_year_end: { type: Type.STRING } 
              }, 
              required: ["legal_name", "registration_number", "business_type", "tax_identification_number", "financial_year_end"] 
            },
            account_metadata: { 
              type: Type.OBJECT, 
              properties: { 
                bank_name: { type: Type.STRING }, 
                account_name: { type: Type.STRING }, 
                account_number: { type: Type.STRING }, 
                opening_balance: { type: Type.NUMBER }, 
                closing_balance: { type: Type.NUMBER }, 
                earliest_transaction_date: { type: Type.STRING }, 
                latest_transaction_date: { type: Type.STRING } 
              }, 
              required: ["bank_name", "account_name", "account_number", "opening_balance", "closing_balance", "earliest_transaction_date", "latest_transaction_date"] 
            },
            transactions: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  date: { type: Type.STRING }, 
                  description: { type: Type.STRING }, 
                  withdrawal_amount: { type: Type.NUMBER }, 
                  deposit_amount: { type: Type.NUMBER }, 
                  balance_after: { type: Type.NUMBER }, 
                  year_of_assessment: { type: Type.STRING }, 
                  financial_year_label: { type: Type.STRING }, 
                  financial_month_label: { type: Type.STRING }, 
                  audit_tags: { 
                    type: Type.OBJECT, 
                    properties: { 
                      type: { type: Type.STRING }, 
                      counterparty_type: { type: Type.STRING }, 
                      notes: { type: Type.STRING } 
                    }, 
                    required: ["type", "counterparty_type"] 
                  } 
                }, 
                required: ["date", "description", "balance_after", "audit_tags", "year_of_assessment", "financial_year_label", "financial_month_label"] 
              } 
            },
            financial_year_summaries: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  financial_year_label: { type: Type.STRING }, 
                  financial_year_end_date: { type: Type.STRING },
                  months: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        month_label: { type: Type.STRING }, 
                        start_date: { type: Type.STRING },
                        end_date: { type: Type.STRING },
                        total_deposits: { type: Type.NUMBER }, 
                        total_withdrawals: { type: Type.NUMBER }, 
                        by_audit_type: { 
                          type: Type.OBJECT, 
                          properties: { 
                            salary: { type: Type.NUMBER }, 
                            epf_socso: { type: Type.NUMBER }, 
                            director_drawing: { type: Type.NUMBER }, 
                            tax_payment: { type: Type.NUMBER }, 
                            loan_repayment: { type: Type.NUMBER }, 
                            revenue: { type: Type.NUMBER }, 
                            expense: { type: Type.NUMBER }, 
                            other: { type: Type.NUMBER } 
                          } 
                        } 
                      } 
                    } 
                  } 
                } 
              } 
            },
            reconciliation_info: { 
              type: Type.OBJECT, 
              properties: { 
                is_reconciled: { type: Type.BOOLEAN }, 
                calculated_movement: { type: Type.NUMBER }, 
                expected_movement: { type: Type.NUMBER },
                issues: { type: Type.ARRAY, items: { type: Type.STRING } }
              }, 
              required: ["is_reconciled", "calculated_movement", "expected_movement"] 
            }
          }
        }
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("The AI provided an empty response. This can happen if the images are unreadable or the model is overloaded.");
    }
    
    try {
      return JSON.parse(text) as BankStatementData;
    } catch (parseErr) {
      console.error("JSON Parsing Error. Raw output:", text);
      throw new Error("The AI generated data that couldn't be parsed. Please try a clearer scan of the document.");
    }
  } catch (err: any) {
    console.error("AI Extraction failure:", err);
    throw new Error(err.message || "Failed to communicate with AI for data extraction.");
  }
};

export const inferPersona = async (userInput: string): Promise<AssistantPersona> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this user message, determine if they are asking about:
1. Tax planning & Malaysian income tax (choose 'tax')
2. Audit, reconciliation & forensic checks (choose 'audit')
If unclear, choose 'none'.
Message: "${userInput}"
Respond only with the word 'tax', 'audit', or 'none'.`,
  });
  const result = response.text?.trim().toLowerCase();
  if (result === 'tax') return 'tax';
  if (result === 'audit') return 'audit';
  return 'none';
};

export const askAuditAssistant = async (
  query: string, 
  history: ChatMessage[], 
  data?: BankStatementData, 
  profile?: BusinessProfile, 
  lang: SupportedLanguage = 'en',
  persona: AssistantPersona = 'none'
): Promise<ChatMessage> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = data ? `Entity: ${data.business_profile_snapshot.legal_name}. Account: ${data.account_metadata.account_number}.` : `No data extracted yet.`;

  let personaInstruction = "";
  if (persona === 'tax') {
    personaInstruction = "You are Mr RP. Your specialty is Tax planning & Malaysian income tax. Focus on LHDN compliance, tax savings, and allowable deductions.";
  } else if (persona === 'audit') {
    personaInstruction = "You are The Aoutha. Your specialty is Audit, reconciliation & forensic checks. Focus on financial consistency, suspicious patterns, and account reconciliation.";
  } else {
    personaInstruction = "You are the MYAUDIT assistant.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      { role: 'user', parts: [{ text: `System Context: ${context}. User Language: ${lang}.` }] },
      ...history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
      { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction: `${personaInstruction} Respond strictly in ${lang === 'ms' ? 'Bahasa Malaysia' : lang === 'zh' ? 'Mandarin Chinese' : 'English'}. Provide professional Malaysian forensic audit or tax guidance based on your persona.`,
    },
  });

  return { role: 'model', text: response.text || "Error." };
};

export const quickResponse = async (query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: query,
  });
  return response.text || "";
};
