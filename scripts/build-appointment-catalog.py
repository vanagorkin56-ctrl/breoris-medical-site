"""Build the public administrator-request catalogue without a Health24 dependency."""
import json
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
roster = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./dist/data.js")))'], cwd=ROOT))
catalog = {'services': [n for names in roster['groups'].values() for n in names], 'doctors': [{'id': d['id'], 'name': d['name'], 'specialty': d['role'], 'services': d['services']} for d in roster['doctors'] if not d.get('specialtyPending')], 'startingPrices': json.loads(subprocess.check_output(['node', '-e', 'global.window={};require("./dist/consultation-prices.js");require("./dist/pricing.js");console.log(JSON.stringify({...window.BreorisConsultationPrices,...window.BreorisPricing.startingPrices}))'], cwd=ROOT))}
(ROOT / 'dist/appointment-catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
print(f'Generated request catalogue: {len(catalog["doctors"])} doctors, {len(catalog["services"])} services.')
