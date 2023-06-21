import express from 'express';
import { getData } from '../utils/database.js';

const router = express.Router();

router.get('/save', async (req, res) => {
    const { page, start_period, end_period, barcode } = req.query;
    const pageCount = 30;
    let pageQuery = '';
    let periodQuery = '';
    let barcodeQuery = '';

    if (barcode) {
        barcodeQuery = `WHERE barcode =~ /${barcode} */`;
    }

    if (start_period && end_period) {
        const startDate = new Date(start_period);
        const endDate = new Date(end_period);
        periodQuery = `AND time >= ${startDate.getTime()}ms AND time <= ${endDate.getTime()}ms`;
    }

    if (page && page > 0) {
        const offset = (page - 1) * pageCount;
        pageQuery = `OFFSET ${offset}`;
    }

    const query = `
        SELECT * FROM completed_data
        ${barcodeQuery} ${periodQuery}
        ORDER BY time DESC
        LIMIT ${pageCount} ${pageQuery}
    `;
    return res.json(await getData(query));
});

export default router;

