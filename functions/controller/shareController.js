const { db } = require('../config/firebase');
const shareCollection = db.collection('Share');
module.exports.shareController = {

    async add(req, res) {
        const { Owner, Role, SharedUser, Type, TypeId } = req.body;
        try {
            const shareInfo = {
                Owner, Role, SharedUser, Type, TypeId
            };
            //add validation here;

            await shareCollection.add(shareInfo);

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
            const share = (await shareCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: share
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Owner, Role, SharedUser, Type, TypeId } = req.body;
        try {
            const newShareInfo = {
                Owner, Role, SharedUser, Type, TypeId
            };
            await shareCollection.doc(id).update(newShareInfo);
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
            await shareCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}