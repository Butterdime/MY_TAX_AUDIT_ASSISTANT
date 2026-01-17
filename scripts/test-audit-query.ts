import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * MYA-TECH-025: Watchtower Verification
 * Authority: RPR-KONTROL / SENTINEL
 * Objective: Verify local identity library can access live data from rpr-myaudit.
 */

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardened path to Service Account
const serviceAccountPath = path.resolve(__dirname, '../secrets/rpr-myaudit-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const ENTITY_ID = 'massive-activation-1234567-X';

async function testAuditQuery() {
  console.log('🔍 WATCHTOWER: Verifying local identity library access...');

  try {
    // Query the entities collection
    const entityRef = db.collection('entities').doc(ENTITY_ID);
    const entityDoc = await entityRef.get();

    if (!entityDoc.exists) {
      console.error('❌ Entity document not found:', ENTITY_ID);
      process.exit(1);
    }

    const entityData = entityDoc.data();
    console.log('✅ Entity document retrieved:');
    console.log(`   Name: ${entityData?.name}`);
    console.log(`   MyCoID: ${entityData?.myCoID}`);
    console.log(`   Status: ${entityData?.status}`);
    console.log(`   Region: ${entityData?.region}`);

    // Query the assessmentYears subcollection
    const assessmentYearsRef = entityRef.collection('assessmentYears');
    const assessmentYearsSnapshot = await assessmentYearsRef.get();

    console.log(`✅ Assessment Years subcollection: ${assessmentYearsSnapshot.size} document(s)`);
    assessmentYearsSnapshot.forEach((doc) => {
      console.log(`   - ${doc.id}: ${JSON.stringify(doc.data())}`);
    });

    // Query governance collection
    const governanceRef = db.collection('governance');
    const governanceSnapshot = await governanceRef
      .where('entityId', '==', ENTITY_ID)
      .limit(1)
      .get();

    console.log(`✅ Governance entries: ${governanceSnapshot.size} document(s)`);
    governanceSnapshot.forEach((doc) => {
      const govData = doc.data();
      console.log(`   - Event: ${govData?.event}, Operator: ${govData?.operator}`);
    });

    console.log('🏁 WATCHTOWER VERIFICATION COMPLETE: Local identity library can access live data.');
  } catch (error) {
    console.error('❌ WATCHTOWER VERIFICATION FAILED:', error);
    process.exit(1);
  }
}

testAuditQuery();
