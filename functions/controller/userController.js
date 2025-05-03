const { db } = require('../config/firebase');
const userCollection = db.collection('User');
const { loginSessionController } = require('./loginSessionController');
module.exports.userController = {

  //Register user
  async register(req, res) {

    const { Email, Password, UserName, EmailVerified, EnableUpdateNoti, Notification, TaskNotiMessage, UpdateNotiMes, Role } = req.body;
    try {
      const userInfo = { Email, Password, UserName, EmailVerified, EnableUpdateNoti, Notification, TaskNotiMessage, UpdateNotiMes, Role, DateCreated: new Date() };
      //add validation here;

      await userCollection.add(userInfo);

      res.status(200).send({
        status: 'Success',
        message: 'Success',
      });
    } catch (error) {
      res.status(500).json("this is error:" + error.message + error);
    }
  },

  async login(req, res) {
    const { UserName, Password, sessionToken: rawSessionToken } = req.body;
    let sessionToken = rawSessionToken ?? "";
    let userData = {};
    let userSnapshot;
  
    try {
      // Check login via session token
      if (sessionToken) {
        const sessionData = await loginSessionController.getDataFromSessionToken(sessionToken);
        userData = sessionData.userData;
        sessionToken = sessionData.sessionInfo;
  
        if (!userData) {
          return res.status(404).json("User not found or session expired");
        }
      }
  
      // Check login via username/password
      if (UserName && Password) {
        userSnapshot = await userCollection
          .where("UserName", "==", UserName)
          .where("Password", "==", Password) // Consider hashing for security
          .limit(1)
          .get();
  
        if (userSnapshot.empty) {
          return res.status(404).json("User not found or wrong password");
        }
  
        const userDoc = userSnapshot.docs[0];
        userData = userDoc.data();
        sessionToken = await loginSessionController.generateNewSessionToken(userDoc.id);
      }
  
      // Sanitize user data
      if (userData.Password) delete userData.Password;
  
      return res.status(200).json({
        status: 'Success',
        message: 'Login successful',
        data: userData,
        sessionToken,
        // apiKey: getApiKey(userDoc.id) // Optional
      });
  
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

      if (user.Password == OldPassword) {
        user.Password = NewPassword;
        await userCollection.doc(id).update(user);
        res.status(200).send({
          status: 'Success',
          message: 'Success'
        });
      } else {
        res.status(400).json("Current password does not match")
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  async updateUser(req, res) {
    const { UserName, Email } = req.body;
    try {
      const { id } = req.params;
      const user = (await userCollection.doc(id).get()).data();

      const userInfo = {
        Email: Email,
        UserName: UserName
      };

      await userCollection.doc(id).update(userInfo);

      res.status(200).send({
        status: 'Success',
        message: 'Success'
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userCollection.doc(id).delete();

      res.status(200).send({
        status: 'Success',
        message: 'Success'
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }

}