import express from 'express';
import { remote } from '../config/index.js';
import { readOPC, remoteOPC } from '../opc.js';

const router = express.Router();

router.post('/remote', async (req, res) => {
    const { action } = req.body;
    
    const nodeId = remote[action];

    if (action === 'light') {
        const isOn = await readOPC(nodeId);
        if (typeof isOn === 'boolean') {
            remoteOPC(nodeId, !isOn);
        }
    } else {
        remoteOPC(nodeId, true);
    }
});

export default router;

