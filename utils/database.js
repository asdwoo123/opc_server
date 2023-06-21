import Influx from 'influx';
import { save } from '../config/index.js';

const measurement = save.table;

const fields = {};

save.fields.forEach((field) => {
    fields[field.name] = Influx.FieldType['STRING'];
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

