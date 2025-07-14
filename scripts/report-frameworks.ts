import 'ts-node/register';
import { frameworkData } from '../src/data/frameworks';

async function reportFrameworks() {
  console.log('Frameworks Summary:');
  for (const [slug, fw] of Object.entries(frameworkData)) {
    const ctrlCount = fw.controls.length;
    const subCount = fw.controls.reduce((sum, ctrl) => sum + (ctrl.subcontrols?.length || 0), 0);
    console.log(`${slug}: controls=${ctrlCount}, subcontrols=${subCount}`);
  }
}

reportFrameworks().catch(err => {
  console.error('Error reporting frameworks:', err);
  process.exit(1);
});
