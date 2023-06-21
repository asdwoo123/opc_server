import express from 'express';
import ip from 'ip';

const router = express.Router();

router.get('/setting', (req, res) => {
    res.statusCode = 200;
    res.json({ ...db.data, ip: ip.address() });
});

router.post('/setting', (req, res) => {
    const { setting } = req.body;
    db.data = {...db.data, ...setting};
    db.write();

    setTimeout(() => {
        exec('pm2 reload app.js');
    }, 2000);
    res.statusCode = 200;
    return;

});

export default router;
