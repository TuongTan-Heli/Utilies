const { db } = require('../config/firebase');
const taskCollection = db.collection('Task');
module.exports.taskController = {

    async add(req, res) {
        const { User, Type, Deadline, Description, Done, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification, Priority, Share  } = req.body;
        try {
            const taskInfo = {
                User, Type, Deadline, Description, Done, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification, Priority, Share 
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

    async get(req, res) {
        try {
            const { id } = req.params;
            const task = (await taskCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: task
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { User, Type, Deadline, Description, Done, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification, Priority, Share  } = req.body;
        try {
            const newTaskInfo = {
                User, Type, Deadline, Description, Done, EnableNoti, LastNotiDate, Name, NotiOnDeadline, Notification, Priority, Share 
            };
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