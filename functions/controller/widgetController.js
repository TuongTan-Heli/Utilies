const { db, Timestamp } = require('../config/firebase');
const taskCollection = db.collection('Task');
const expenseCollection = db.collection('Spending');
const { transferFirestoreWithNestedReferences, validateRes } = require('../utils/utils');
const { withAuth } = require('../utils/withAuth');

const widgetController = {
    async refresh(req, res) {
        try {
            const auth = await withAuth(req, res);
            if (auth.error) return;

            const { userRef, apiKey } = auth;

            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 31);

            const [tasksSnap, expenseSnap] = await Promise.all([
                taskCollection.where("User", "==", userRef).get(),
                expenseCollection
                    .where("User", "==", userRef)
                    .where("Date", ">=", fromDate)
                    .orderBy("Date", "desc")
                    .get()
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
                status: "Success",
                message: "Success",
                data: cookedTasks.concat(cookedExpense),
                apiKey,
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
    async quickAdd(req, res) {
        try {
            const auth = await withAuth(req, res);
            if (auth.error) return;

            const { userRef, userData, apiKey } = auth;
            const { Name, Price, Type, ExpenseType, SelectedDate, Description } = req.body;
            const currency = userData.DefaultCurrency ? await db.collection('Currency').doc(userData.DefaultCurrency.id) : null;
            switch (Type) {
                case "To do":
                case "To buy":
                    const taskInfo = {
                        User: userRef,
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
                case "Expense": {
                    const date =
                        SelectedDate && !isNaN(new Date(SelectedDate))
                            ? Timestamp.fromDate(new Date(SelectedDate))
                            : Timestamp.fromDate(new Date());

                    const expenseInfo = {
                        User: userRef,
                        Type: ExpenseType,
                        Amount: Price || 0,
                        Currency: currency,
                        Date: date,
                        Description,
                    };
                    await expenseCollection.add(expenseInfo);
                    break;
                }
                default:
                    return res.status(400).json({ message: "Invalid Type" });
            }

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                apiKey,
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }

    }
}

module.exports.widgetController = widgetController;
