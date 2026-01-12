/**
 * Staff Welfare Logic - Tier 1 Advisory
 * 
 * Implements the Deductibility Insight Engine (DIE) for detecting
 * Entertainment entries that may qualify as Staff Welfare (100% deductible).
 * 
 * This is a Tier 1 Advisory function - it only suggests, never auto-applies.
 * All suggestions require explicit user approval (requiresMutation: true).
 */

import { firestore } from 'firebase-admin';
import { LedgerEntry } from '../types';

/**
 * Rule Registry interface for keyword matching
 */
interface RuleRegistry {
  id: string;
  ruleId: string;
  ya: number;
  type: 'DEDUCTIBILITY_RULE' | 'INCENTIVE';
  conditions: {
    category: string;
    keywords: string[];
  };
  descriptionSimpleEN: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Staff Welfare suggestion result
 */
export interface StaffWelfareSuggestion {
  eligible: boolean;
  confidence: number; // 0-1 scale
  taxImpact: {
    currentDeduction: number; // Entertainment: 50% of amount
    suggestedDeduction: number; // Staff Welfare: 100% of amount
    taxSavings: number; // Difference at 24% tax rate
  };
  message: string;
  ruleReference?: string;
}

/**
 * Tier 1 Advisory signal compatible with GuardianAuditSignal
 */
export interface StaffWelfareAdvisorySignal {
  id: string;
  tier: 'TIER_1_ADVISORY';
  message: string;
  suggestedAction: {
    category: 'Staff Welfare';
    originalCategory: string;
    taxSavings: number;
  };
  requiresMutation: true; // Always true - user must approve
  confidence: number;
}

/**
 * Default tax rate (highest SME band for conservative calculation)
 */
const DEFAULT_TAX_RATE = 0.24; // 24% - highest SME tax rate

/**
 * Staff Welfare keywords from Rule Registry
 * These match the ENTERTAINMENT_VS_WELFARE rule
 */
const STAFF_WELFARE_KEYWORDS = [
  'annual dinner',
  'staff trip',
  'team building',
  'pantry',
  'staff lunch',
  'staff dinner',
  'company dinner',
  'employee welfare',
  'staff welfare',
  'team lunch',
  'team dinner',
  'staff event',
  'company event',
  'staff gathering',
  'employee gathering'
];

/**
 * Analyzes a ledger entry to determine if it may qualify for Staff Welfare reclassification.
 * 
 * @param entry - The ledger entry to analyze
 * @param ruleRegistry - Optional rule registry for keyword matching (if not provided, uses default keywords)
 * @returns StaffWelfareSuggestion with eligibility, confidence, and tax impact
 */
export function analyzeStaffWelfareEligibility(
  entry: LedgerEntry,
  ruleRegistry?: RuleRegistry[]
): StaffWelfareSuggestion {
  // Default: not eligible
  const defaultResult: StaffWelfareSuggestion = {
    eligible: false,
    confidence: 0,
    taxImpact: {
      currentDeduction: 0,
      suggestedDeduction: 0,
      taxSavings: 0,
    },
    message: '',
  };

  // Only analyze Entertainment category entries
  if (entry.category !== 'Entertainment') {
    return defaultResult;
  }

  // Get amount (use debit as expense amount)
  const amount = entry.debit || 0;
  if (amount <= 0) {
    return defaultResult;
  }

  // Normalize description for keyword matching
  const description = (entry.description || '').toLowerCase();

  // Extract keywords from rule registry if provided
  let keywordsToMatch = STAFF_WELFARE_KEYWORDS;
  let ruleReference: string | undefined;

  if (ruleRegistry) {
    const welfareRule = ruleRegistry.find(
      (rule) => rule.ruleId === 'ENTERTAINMENT_VS_WELFARE' && rule.type === 'DEDUCTIBILITY_RULE'
    );

    if (welfareRule && welfareRule.conditions.keywords) {
      keywordsToMatch = welfareRule.conditions.keywords.map((k) => k.toLowerCase());
      ruleReference = welfareRule.id;
    }
  }

  // Check for keyword matches
  const matchedKeywords = keywordsToMatch.filter((keyword) => description.includes(keyword));

  if (matchedKeywords.length === 0) {
    return defaultResult;
  }

  // Calculate confidence based on keyword matches
  // Multiple keyword matches = higher confidence
  const confidence = Math.min(0.5 + matchedKeywords.length * 0.15, 0.95);

  // Calculate tax impact
  // Entertainment: 50% deductible
  const entertainmentDeduction = amount * 0.5;
  const entertainmentTaxBenefit = entertainmentDeduction * DEFAULT_TAX_RATE;

  // Staff Welfare: 100% deductible
  const staffWelfareDeduction = amount * 1.0;
  const staffWelfareTaxBenefit = staffWelfareDeduction * DEFAULT_TAX_RATE;

  // Tax savings from reclassification
  const taxSavings = staffWelfareTaxBenefit - entertainmentTaxBenefit;

  return {
    eligible: true,
    confidence,
    taxImpact: {
      currentDeduction: entertainmentDeduction,
      suggestedDeduction: staffWelfareDeduction,
      taxSavings,
    },
    message: `This entry may qualify as Staff Welfare (100% deductible) instead of Entertainment (50% deductible). Potential tax savings: RM ${taxSavings.toFixed(2)}.`,
    ruleReference,
  };
}

/**
 * Converts a StaffWelfareSuggestion to a GuardianAuditSignal-compatible format.
 * 
 * @param entryId - The ledger entry ID
 * @param entry - The ledger entry
 * @param suggestion - The staff welfare suggestion
 * @returns StaffWelfareAdvisorySignal ready for UI display
 */
export function createAdvisorySignal(
  entryId: string,
  entry: LedgerEntry,
  suggestion: StaffWelfareSuggestion
): StaffWelfareAdvisorySignal | null {
  if (!suggestion.eligible) {
    return null;
  }

  return {
    id: entryId,
    tier: 'TIER_1_ADVISORY',
    message: `FORENSIC INSIGHT: ${suggestion.message}`,
    suggestedAction: {
      category: 'Staff Welfare',
      originalCategory: entry.category,
      taxSavings: suggestion.taxImpact.taxSavings,
    },
    requiresMutation: true, // User must explicitly approve
    confidence: suggestion.confidence,
  };
}

/**
 * Logs a staff welfare suggestion to Firestore audit trail.
 * 
 * @param entryId - The ledger entry ID
 * @param suggestion - The staff welfare suggestion
 * @param yearId - The financial year ID (e.g., 'ya2026')
 */
export async function logStaffWelfareSuggestion(
  entryId: string,
  suggestion: StaffWelfareSuggestion,
  yearId: string
): Promise<void> {
  if (!suggestion.eligible) {
    return; // Don't log non-eligible suggestions
  }

  try {
    await firestore()
      .collection('auditLogs')
      .add({
        timestamp: firestore.FieldValue.serverTimestamp(),
        event: 'STAFF_WELFARE_SUGGESTION',
        entryId,
        yearId,
        details: {
          confidence: suggestion.confidence,
          taxImpact: suggestion.taxImpact,
          ruleReference: suggestion.ruleReference,
        },
        source: 'staffWelfareLogic',
        engineVersion: 'v1.0',
      });
  } catch (error) {
    // Log error but don't throw - audit logging should not break main flow
    console.error('Failed to log staff welfare suggestion:', error);
  }
}

/**
 * Main analysis function that combines eligibility check, signal creation, and audit logging.
 * 
 * @param entryId - The ledger entry ID
 * @param entry - The ledger entry to analyze
 * @param yearId - The financial year ID
 * @param ruleRegistry - Optional rule registry for keyword matching
 * @returns StaffWelfareAdvisorySignal if eligible, null otherwise
 */
export async function analyzeAndSuggestStaffWelfare(
  entryId: string,
  entry: LedgerEntry,
  yearId: string,
  ruleRegistry?: RuleRegistry[]
): Promise<StaffWelfareAdvisorySignal | null> {
  // Analyze eligibility
  const suggestion = analyzeStaffWelfareEligibility(entry, ruleRegistry);

  // Create advisory signal
  const signal = createAdvisorySignal(entryId, entry, suggestion);

  // Log to audit trail (async, don't await)
  if (signal) {
    logStaffWelfareSuggestion(entryId, suggestion, yearId).catch((err) => {
      console.error('Audit log error (non-blocking):', err);
    });
  }

  return signal;
}
