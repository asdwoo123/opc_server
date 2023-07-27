import fs from 'fs';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { v4 } from 'uuid';

let defaultConfig = fs.readFileSync('config/default-config.json');
defaultConfig = defaultConfig.toString();
defaultConfig = JSON.parse(defaultConfig);

const adapter = new JSONFileSync('config/config.json');
const db = new LowSync(adapter, defaultConfig);
db.read();

if (!db.data.uuid) {
    db.data.uuid = v4();
    db.write();
}

export { db };
