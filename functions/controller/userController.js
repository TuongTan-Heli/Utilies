const { db } = require('../config/firebase');
const userCollection = db.collection('User');
const { loginSessionController } = require('./loginSessionController');
const { apiKeyController } = require('./apiKeyController');
const currencyCollection = db.collection('Currency');
const bcrypt = require('bcrypt');
const { transferFirestoreWithNestedReferences, validateRes } = require('../utils/utils');

const userController = {
  async register(req, res) {
    const { Email, Password, UserName } = req.body;
    try {
      const hashedPassword = await userController.hashPassword(Password);
      const DefaultCurrencySnapshot = await currencyCollection
        .where("Name", "==", "AUD")
        .get();
      const DefaultCurrency = DefaultCurrencySnapshot.docs[0].ref;
      const userInfo = {
        Email, "Password": hashedPassword,
        UserName,
        EmailVerified: false,
        EnableUpdateNoti: false,
        Notification: null,
        TaskNotiMessage: "Hello, you have {taskName} undone and due soon.",
        UpdateNotiMes: "Hello, you haven't updated your spending for a while.",
        Role: "User",
        DefaultCurrency,
        DateCreated: new Date()
      };
      //add validation here;

      await userCollection.add(userInfo);

      res.status(200).send(validateRes({
        status: 'Success',
        message: 'Success',
      }));
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  async login(req, res) {
    const { UserName, Password, sessionToken: rawSessionToken } = req.body;
    let sessionToken = rawSessionToken ?? "";
    let userData = {};
    let userSnapshot;
    let apiKey = "";
    let userId = "";
    try {
      // Check login via session token
      if (sessionToken) {
        const sessionData = await loginSessionController.getDataFromSessionToken(sessionToken);
        userData = sessionData.sessionInfo.User;
        sessionToken = {
          SessionToken: sessionData.sessionInfo.SessionToken,
          Expire: sessionData.sessionInfo.Expire
        };
        userId = sessionData.userId;
        if (!userData) {
          return res.status(404).json("User not found or session expired");
        }
      }

      // Check login via username/password
      if (UserName && Password) {
        let isPasswordValid = false;
        userSnapshot = await userCollection
          .where("UserName", "==", UserName)
          .get();

        for (const user of userSnapshot.docs) {
          userData = await transferFirestoreWithNestedReferences(user);
          isPasswordValid = await bcrypt.compare(Password, userData.Password);
          if (isPasswordValid) {
            sessionToken = await loginSessionController.generateNewSessionToken(user);
            userId = user.id;
          }
        }
        if (!isPasswordValid) {
          return res.status(404).json("User not found or wrong password");
        }
      }

      //expect to generate or update api
      apiKey = await apiKeyController.checkExpireOrGenerateApi(null, userCollection.doc(userId));
      delete apiKey.User

      return res.status(200).send(validateRes({
        status: 'Success',
        message: 'Login successful',
        data: userData,
        sessionToken,
        apiKey
      }));

    } catch (error) {
      return res.status(500).json({ status: 'Error', message: error.message });
    }
  },

  async changePassword(req, res) {
    const { OldPassword, NewPassword } = req.body;
    try {
      // const Password = NewPassword;
      const { id } = req.params;
      const user = (await userCollection.doc(id).get()).data();
      const isPasswordValid = await bcrypt.compare(OldPassword, user.Password);

      if (isPasswordValid) {
        user.Password = await userController.hashPassword(NewPassword);
        await userCollection.doc(id).update(user);
        res.status(200).send(validateRes({
          status: 'Success',
          message: 'Success'
        }));
      } else {
        res.status(401).json("Current password does not match")
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  async updateUser(req, res) {
    const { UserName, Email, DefaultCurrencyId } = req.body;
    try {
      const { id } = req.params;
      const DefaultCurrency = await currencyCollection.doc(DefaultCurrencyId);
      const userInfo = {
        Email,
        UserName,
        DefaultCurrency
      };

      await userCollection.doc(id).update(userInfo);

      res.status(200).send(validateRes({
        status: 'Success',
        message: 'Success'
      }));
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userCollection.doc(id).delete();
      //handle delete everything related to user

      res.status(200).send(validateRes({
        status: 'Success',
        message: 'Success'
      }));
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
}

module.exports.userController = userController;