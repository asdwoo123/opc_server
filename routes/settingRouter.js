import express from 'express';
import ip from 'ip';
import { db } from '../config/index.js';

const router = express.Router();

router.get('/setting', (req, res) => {
    res.statusCode = 200;
    res.json({ ...db.data, ip: ip.address() });
});

router.post('/setting', (req, res) => {
    const { setting } = req.body;
    db.data = {...db.data, ...setting};
    db.write();

    res.statusCode = 200;
    return;

});

export default router;

