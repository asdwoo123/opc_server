import express from 'express';
import { getData } from '../utils/database.js';

const router = express.Router();

router.get('/save', async (req, res) => {
    const { page, start_period, end_period, barcode } = req.query;

    const pageCount = 30;
    let pageQuery = '';
    let periodQuery = '';
    const barcodeQuery = `WHERE barcode =~ /${barcode}/`;

    /* if ((start_period && end_period) && (start_period !== 'null' && end_period !== 'null')) {
        const startDate = new Date(start_period);
        const endDate = new Date(end_period);
        periodQuery = `AND time >= ${startDate.getTime()} AND time <= ${endDate.getTime()}`;
    } */

    if (page) {
        const offset = page * pageCount;
        pageQuery = `OFFSET ${offset}`;
    }


    const query = `
        SELECT COUNT(*) FROM completed_data
        ${barcodeQuery} ${periodQuery};
        SELECT * FROM completed_data
        ${barcodeQuery} ${periodQuery}
        ORDER BY time DESC
        LIMIT ${pageCount} ${pageQuery}
    `;

    const result = await getData(query);

    const count = (result[0]) ? result[0][0]['count_barcode'] : 0;
    const data = (result[1]) ? result[1] : [];

    console.log(data.length);
    
    return res.json({
        count, data
    });
});

export default router;

