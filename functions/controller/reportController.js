const { db } = require('../config/firebase');
const reportCollection = db.collection('Report');
module.exports.reportController = {

    async add(req, res) {
        const { User, From, To, Excel, Currency, Share } = req.body;
        try {
            const reportInfo = {
                User, From, To, Excel, Currency, Share
            };
            //add validation here;

            await reportCollection.add(reportInfo);

            res.status(200).send({
                status: 'Success',
                message: 'Success'
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async get(req, res) {
        try {
            const { id } = req.params;
            const report = (await reportCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: report
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { User, From, To, Excel, Currency, Share } = req.body;
        try {
            const newReportInfo = {
                User, From, To, Excel, Currency, Share
            };
            await reportCollection.doc(id).update(newReportInfo);
            res.status(200).send({
                status: 'Success',
                message: 'Success'
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await reportCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}