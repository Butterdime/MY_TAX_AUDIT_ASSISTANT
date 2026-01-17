import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * MYA-TECH-021: Sovereign Data Seeding
 * Authority: RPR-KONTROL / SENTINEL
 * Objective: Initialize Massive Activation Sdn. Bhd. (YA 2017) in rpr-myaudit.
 */

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardened path to Service Account (Ensure this is in your .gitignore)
const serviceAccountPath = path.resolve(__dirname, '../secrets/rpr-myaudit-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const ENTITY_ID = 'massive-activation-1234567-X';

async function seedSubstrate() {
  console.log('🛡️ SENTINEL: Initiating Sovereign Seeding Protocol...');

  const entityRef = db.collection('entities').doc(ENTITY_ID);

  const entityData = {
    name: 'Massive Activation Sdn. Bhd.',
    myCoID: '1234567-X',
    incDate: '2015-05-20',
    ownerId: 'founder-node', // Must match your auth.uid for testing
    status: 'ACTIVE',
    region: 'asia-southeast1',
    assessmentYears: ['2017'],
    metadata: {
      governance: 'RPR-KONTROL v1.0',
      initializedAt: new Date().toISOString(),
    },
  };

  try {
    // 1. Seed Entity Root
    await entityRef.set(entityData);
    console.log(`✅ Entity [${ENTITY_ID}] successfully anchored.`);

    // 2. Seed YA 2017 Folder
    await entityRef.collection('assessmentYears').doc('2017').set({
      year: '2017',
      integrityScore: 0.98,
      isAuditMode: false,
      lastExtraction: null,
    });
    console.log('✅ YA 2017 Assessment year folder created.');

    // 3. Seed Governance Entry
    await db.collection('governance').doc(`${ENTITY_ID}_init`).set({
      entityId: ENTITY_ID,
      event: 'SUBSTRATE_INITIALIZED',
      timestamp: new Date().toISOString(),
      operator: 'SENTINEL_INIT_SCRIPT',
    });
    console.log('✅ Governance logs initialized.');

    console.log('🏁 SEEDING COMPLETE: rpr-myaudit is now functionally active.');
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
}

seedSubstrate();
