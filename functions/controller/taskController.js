const { db } = require('../config/firebase');
const taskCollection = db.collection('Task');
const userCollection = db.collection('User');
const currencyCollection = db.collection('Currency');

const taskController = {
    async add(req, res) {
        const { UserId, Type, Deadline, Description, EnableNoti, Name, NotiOnDeadline, Priority, Price, CurrencyId } = req.body;
        try {
            const User = await userCollection.doc(UserId);
            let Currency = null;
            if (CurrencyId) {
                Currency = await currencyCollection.doc(CurrencyId);
            }

            const taskInfo = {
                User, Type, Deadline, Description, Done: null, EnableNoti, LastNotiDate: null, Name, NotiOnDeadline, Notification: null, Priority, Share: null, Currency, Price
            };
            //add validation here;

            await taskCollection.add(taskInfo);

            res.status(200).send({
                status: 'Success',
                message: 'Success'
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async getAll(req, res) {
        try {
            const { id } = req.params;
            const user = userCollection.doc(id);
            const tasks = await taskCollection
                .where("User", "==", user)
                .get();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: tasks.docs
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { User, Type, Deadline, Description, Done, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification, Priority, Share } = req.body;
        try {
            const newTaskInfo = {
                User, Type, Deadline, Description, Done, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification, Priority, Share
            };
            const { id } = req.params;
            await taskCollection.doc(id).update(newTaskInfo);
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
            await taskCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.taskController = taskController;