import Influx from 'influx';
import { db } from '../config/index.js';

const { save } = db.data;

const measurement = save.table;

const fields = {
    barcode: Influx.FieldType.STRING,
};

save.fields.forEach((field) => {
    fields[field.name] = Influx.FieldType.STRING;
});

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'mac',
    schema: [
        {
            measurement,
            fields,
            tags: [
                'partNumber'
            ]
    }
    ]
});

influx.getDatabaseNames().then(names => {
    if (!names.includes('mac')) {
        return influx.createDatabase('mac');
    }
});

export async function checkDataExists() {
    try {
        const query = `SELECT * FROM completed_data LIMIT 1`;
        const result = await influx.query(query);
        return result.groupRows.length > 0;   
    } catch (error) {
        return false;
    }
}

export async function getData(query) {
    try {
        const result = await influx.query(query);   
        return result;
    } catch (error) {
        return [];
    }
}

export function saveData(fields) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() + 9);

    influx.writePoints([
        {
            measurement,
            timestamp,
            fields
        }
    ]);
}

export function deleteAllData() {
    influx.query(`DELETE FROM ${measurement}`);
}

let barcode = 10000000;

export function generateDummyData(nodeFields, timestamp) {
    const fields = {};
    fields['barcode'] = barcode.toString();
    barcode += 1;
    nodeFields.forEach(({name}) => {
        const value = Math.floor(Math.random() * 100);
        fields[name] = value;
    });
    
    influx.writePoints([
        {
            measurement,
            timestamp,
            fields
        }
    ]);
}
