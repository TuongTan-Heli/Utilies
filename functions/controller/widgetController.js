const { db } = require('../config/firebase');
const taskCollection = db.collection('Task');
const expenseCollection = db.collection('Spending');
const { loginSessionController } = require('./loginSessionController');
const { transferFirestoreWithNestedReferences, validateRes } = require('../utils/utils');

const widgetController = {
    async refresh(req, res) {
        try {
            const { session } = req.body;
            let user = null;

            const { success, userData } = await loginSessionController.getDataFromSessionToken(session);
            if (!success) {
                return res.status(401).json({ message: "Invalid session token or api key" });
            }
            user = await db.collection('User').doc(userData.id);

            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 31);

            const [tasksSnap, expenseSnap] = await Promise.all([
                taskCollection.where("User", "==", user).get(),
                expenseCollection
                    .where("User", "==", user)
                    .where("Date", ">=", fromDate)
                    .get(),
            ]);

            const cookedTasks = await transferFirestoreWithNestedReferences(tasksSnap.docs, ["User", "Currency"]);

            const cookedExpense = (
                await transferFirestoreWithNestedReferences(expenseSnap.docs, ["User", "Currency"])
            ).map(exp => ({
                ...exp,
                exType: exp.Type,
                Type: "Expense",
            }));

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: cookedTasks.concat(cookedExpense)
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
    async quickAdd(req, res) {
        try {
            const { session } = req.body;
            let user = null;

            const { success, userData } = await loginSessionController.getDataFromSessionToken(session);
            if (!success) {
                return res.status(401).json({ message: "Invalid session token or api key" });
            }
            user = await db.collection('User').doc(userData.id);
            const {Name, Price, Type, ExpenseType} = req.body;
            const currency = userData.DefaultCurrency ? await db.collection('Currency').doc(userData.DefaultCurrency.id) : null;
            switch (Type) {
                case "To do":
                case "To buy":
                    const taskInfo = {
                        User: user,
                        Type: Type,
                        Deadline: null,
                        Description: "",
                        Done: null,
                        EnableNoti: false,
                        LastNotiDate: null,
                        Name: Name || "Quick Task",
                        NotiOnDeadline: false,
                        Notification: null,
                        Priority: 0,
                        Share: null,
                        Currency: Type != "task" ? currency : null,
                        Price: Price || 0
                    };
                    await taskCollection.add(taskInfo);
                    break;
                case "Expense":
                    const expenseInfo = {
                        User: user,
                        Type: ExpenseType,
                        Amount: Price || 0,
                        Currency: currency,
                        Date: new Date(),
                        Description: "",
                    };
                    await expenseCollection.add(expenseInfo);
                    break;
                default:
                    return res.status(400).json({ message: "Invalid Type" });
            }

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }

    }
}

module.exports.widgetController = widgetController;
