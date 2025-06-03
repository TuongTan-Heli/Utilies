const { db, Timestamp } = require('../config/firebase');
const { transferFirestoreWithNestedReferences,validateRes } = require('../utils/utils');
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
                User, Type, Deadline: Timestamp.fromDate(new Date(Deadline)), Description, Done: null, EnableNoti, LastNotiDate: null, Name, NotiOnDeadline, Notification: null, Priority, Share: null, Currency, Price
            };
            //add validation here;

            await taskCollection.add(taskInfo);

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success'
            }));
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
                
            const cookedTasks = await transferFirestoreWithNestedReferences(tasks.docs);

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: cookedTasks
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Type, Deadline, Description, Done, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification, Priority, Share, Price } = req.body;
        try {
            const newTaskInfo = {
                Type, Deadline: Timestamp.fromDate(new Date(Deadline)), Description, Done: Done ? Timestamp.fromDate(new Date(Done)) : null, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification: null, Priority, Share: null, Price
            };
            const { id } = req.params;
            await taskCollection.doc(id).update(newTaskInfo);
            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success'
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await taskCollection.doc(id).delete();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.taskController = taskController;