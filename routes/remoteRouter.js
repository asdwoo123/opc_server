import express from 'express';
import { db } from '../config/index.js';
import { readOPC, remoteOPC } from '../opc.js';

const { remote } = db.data;

const router = express.Router();

router.post('/remote', async (req, res) => {
    const { action } = req.body;
    
    const nodeId = remote[action];

    try {
        if (action === 'light') {
            const isOn = await readOPC(nodeId);
            if (typeof isOn === 'boolean') {
                remoteOPC(nodeId, !isOn);
            }
        } else {
            remoteOPC(nodeId, true);
        }
        
        return res.statusCode = 200;
    } catch (error) {
        return res.statusCode = 500;
    }
});

router.get('/light', async (req, res) => {
    const nodeId = remote['light'];

    const isOn = await readOPC(nodeId);
    return res.json({
        isOn
    });
});

router.post('/light', async (req, res) => {
    const nodeId = remote['light'];

    const isOn = await readOPC(nodeId);
    if (typeof isOn === 'boolean') {
        remoteOPC(nodeId, !isOn);
    }
});

export default router;

