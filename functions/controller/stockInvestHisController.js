const { db } = require('../config/firebase');
const stockInvestHisCollection = db.collection('StockInvestHis');
module.exports.stockInvestHisController = {

    async add(req, res) {
        const { User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit } = req.body;
        try {
            const stockInvestHisInfo = {
                User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit
            };
            //add validation here;

            await stockInvestHisCollection.add(stockInvestHisInfo);

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
            const stockInvestHis = (await stockInvestHisCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: stockInvestHis
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit } = req.body;
        try {
            const newStockInvestHisInfo = {
                User, Brand, Amount, Buy, Currency, Date, IsTransfer, Low, Percentage, Price, Profit
            };
            const { id } = req.params;
            await stockInvestHisCollection.doc(id).update(newStockInvestHisInfo);
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
            await stockInvestHisCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}