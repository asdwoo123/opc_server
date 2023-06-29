import express from 'express';
import { remote } from '../config/index.js';
import { readOPC, remoteOPC } from '../opc.js';

const router = express.Router();

router.post('/remote', async (req, res) => {
    const { action } = req.body;
    
    const nodeId = remote[action];

    remoteOPC(nodeId, true);
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

