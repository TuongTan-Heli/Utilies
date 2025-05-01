const { db } = require('../config/firebase');
const notificationCollection = db.collection('Notification');
module.exports.notificationController = {

    async add(req, res) {
        const { DayBeforeDeadline, Every, Time, Type } = req.body;
        try {
            const notificationInfo = {
                Country, Exrate, Name
            };
            //add validation here;

            await notificationCollection.add(notificationInfo);

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
            const notification = (await notificationCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: notification
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { DayBeforeDeadline, Every, Time, Type } = req.body;
        try {
            const newNotificationInfo = {
                Country, Exrate, Name
            };
            await notificationCollection.doc(id).update(newNotificationInfo);
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
            await notificationCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}