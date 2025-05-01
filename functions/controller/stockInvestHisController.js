const { db } = require('../config/firebase');
const stockInvesHisCollection = db.collection('StockInvesHis');
module.exports.stockInvesHisController = {

    async add(req, res) {
        const { User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit } = req.body;
        try {
            const stockInvesHisInfo = {
                User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit
            };
            //add validation here;

            await stockInvesHisCollection.add(stockInvesHisInfo);

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
            const stockInvesHis = (await stockInvesHisCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: stockInvesHis
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit } = req.body;
        try {
            const newStockInvesHisInfo = {
                User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit
            };
            const { id } = req.params;
            await stockInvesHisCollection.doc(id).update(newStockInvesHisInfo);
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
            await stockInvesHisCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}