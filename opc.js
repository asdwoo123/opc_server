import opcua from 'node-opcua';
import { opcEvent } from './utils/event.js';
import { endpoint } from './config/index.js';
import { saveData, checkDataExists, generateDummyData, deleteAllData } from './utils/database.js';
import { save, nodeInfo } from './config/index.js';

let session = null;
let subscription = null;
let monitoredItems = [];

const client = opcua.OPCUAClient.create();

export async function testOPCConnect() {
    const isExists = await checkDataExists();
    if (!isExists) {

        const startDate = new Date('2023-01-01');    
        const endDate = new Date('2023-06-22');    

        const dates = [];
        let currentDate = startDate;
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        }

        for (const date of dates) {
            generateDummyData(save.fields, date);
        }
    }

    let count = 0;

    nodeInfo.forEach(({ name }) => {
        setInterval(() => {
            opcEvent.emit('data', { name: name, value: count.toString() });
            count++;
        }, 1000);
    });
}

export async function opcConnect() {
    await client.connect(endpoint);
    session = client.createSession(null);
    subscription = opcua.ClientSubscription.create(session, {
        requestedPublishingInterval: 1000,
        requestedMaxKeepAliveCount: 10,
        requestedLifetimeCount: 100, 
        maxNotificationsPerPublish: 100,
        publishingEnabled: true,
        priority: 10
    });
    
    subscription.on('started', () => {
        log('subscription started.');
    });

    if (save.active) {
        saveOPC();
    }

    nodeInfo.forEach((node) => {
        monitoringOPC(node);
    });
}

export async function opcDisconnect() {
    await client.disconnect();
    log('클라이언트 연결이 해제되었습니다.');
    if (!session) return;
    await session.close();
    log('세션이 해제되었습니다.');
    if (!subscription) return;
    await subscription.terminate();
    log('구독이 해제 되었습니다.');
    monitoredItems.forEach(async (monitoredItem) => {
        await monitoredItem.terminate();
        console.log('모니터링 항목이 해제되었습니다.');
    });
}

export function saveOPC() {
    const monitoredItem = opcua.ClientMonitoredItem.create(
        subscription,
        {
            nodeId: save.complete,
            attributeId: opcua.AttributeIds.Value
        }, {
        samplingInterval: 1000,
        discardOldest: true,
        queueSize: 10
    });

    monitoredItems.push(monitoredItem);

    monitoredItem.on('changed', async (dataValue) => {
        const data = dataValue.value.value;
      
        if (data) {
          const fields = await Promise.all(save.fields.map(async (field) => {
            const value = await session.readVariableValue(field.nodeId);
            return { [field.name]: value.value.value };
          }));

          saveData(Object.assign({}, ...fields));
        }
      });
}

export async function monitoringOPC({nodeId, name, content}) {
    const monitoredItem = opcua.ClientMonitoredItem.create(
        subscription,
        {
            nodeId,
            attributeId: opcua.AttributeIds.Value
        }, {
        samplingInterval: 1000,
        discardOldest: true,
        queueSize: 10
    });

    monitoredItems.push(monitoredItem);

    monitoredItem.on('changed', (dataValue) => {
        let data = dataValue.value.value;

        if (data === null) return;

        if (data instanceof Array) {
            data = data[1]
        }

        if (name === "Cycle Time") {
            data = data / 1000
            data = data.toFixed(1) + 's'
        }

        if (name === 'message' && data) {
            data = content;
        }

        if (name === 'OK') okCount = data;
        if (name === 'NOK') nokCount = data;
        if (name === 'OK' || name === 'NOK') {
            const detect_rate = Math.floor((nokCount / (okCount + nokCount)) * 100) + '%';
            opcEvent.emit('data', { name: 'detect_rate', value: detect_rate });
        }

        if (typeof dataV !== 'string') {
            data = data.toString();
        }

        opcEvent.emit('data', { name: name, value: data });
    });
}

export async function readOPC(nodeId) {
    if (!session) return;
    try {
        return (await the_session.readVariableValue(nodeId)).value.value;
    } catch (error) {
        return false;
    }
}

export async function remoteOPC(nodeId, value) {
    if (!session) return;

    const nodesToWrite = [{
        nodeId,
        attributeId: opcua.AttributeIds.Value,
        value: {
            value: {
                dataType: opcua.DataType.Boolean,
                value
            }
        }
    }];

    try {
        await session.write(nodesToWrite);
        return true;
    } catch (error) {
        return false;
    }
}
