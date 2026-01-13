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

    try {
      let userData;
      let userId;
      let sessionToken;

      /* =========================
         1️⃣ SESSION LOGIN FIRST
      ========================= */
      if (rawSessionToken) {
        const sessionData =
          await loginSessionController.getDataFromSessionToken(rawSessionToken);

        if (!sessionData || sessionData.isExpired) {
          return res.status(401).json(
            validateRes({
              status: "Error",
              message: "Session expired or invalid",
            })
          );
        }

        userData = sessionData.sessionInfo.User;
        userId = sessionData.userId;

        sessionToken = {
          SessionToken: sessionData.sessionInfo.SessionToken,
          Expire: sessionData.sessionInfo.Expire,
        };
      }

      /* =========================
         2️⃣ USERNAME / PASSWORD
      ========================= */
      else if (UserName && Password) {
        const snapshot = await userCollection
          .where("UserName", "==", UserName)
          .limit(1)
          .get();

        if (snapshot.empty) {
          return res.status(404).json(
            validateRes({
              status: "Error",
              message: "User not found",
            })
          );
        }

        const userDoc = snapshot.docs[0];
        const userInfo = await transferFirestoreWithNestedReferences(userDoc);

        const isValid = await bcrypt.compare(Password, userInfo.Password);
        if (!isValid) {
          return res.status(401).json(
            validateRes({
              status: "Error",
              message: "Incorrect password",
            })
          );
        }

        userData = userInfo;
        userId = userDoc.id;

        sessionToken =
          await loginSessionController.generateNewSessionToken(userDoc);
      }

      /* =========================
         3️⃣ NO AUTH DATA
      ========================= */
      else {
        return res.status(400).json(
          validateRes({
            status: "Error",
            message: "Missing credentials or session token",
          })
        );
      }

      /* =========================
         4️⃣ API KEY CHECK (AFTER AUTH)
      ========================= */
      const apikeyDocs = await db
        .collection("ApiKey")
        .where("User", "==", userCollection.doc(userId))
        .limit(1)
        .get();

      const apiKey =
        await apiKeyController.checkExpireOrGenerateApi(apikeyDocs.docs[0], 
          userCollection.doc(userId)
        );

      delete apiKey.User;

      /* =========================
         5️⃣ SUCCESS RESPONSE
      ========================= */
      return res.status(200).json(
        validateRes({
          status: "Success",
          message: "Login successful",
          data: userData,
          sessionToken,
          apiKey,
        })
      );

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return res.status(500).json({
        status: "Error",
        message: "Internal server error",
      });
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
        res.status(401).json(validateRes({ status: "Success", message: "Current password does not match" }))
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  async updateUser(req, res) {
    const { UserName, Email, DefaultCurrencyId,
      TaskNotiMessage,
      EnableUpdateNoti,
      UpdateNotiMessage } = req.body;
    try {
      const { id } = req.params;
      const DefaultCurrency = await currencyCollection.doc(DefaultCurrencyId);
      const userInfo = {
        Email,
        UserName,
        DefaultCurrency,
        TaskNotiMessage,
        EnableUpdateNoti,
        UpdateNotiMessage
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