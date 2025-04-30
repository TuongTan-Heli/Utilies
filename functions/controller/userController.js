const { db } = require('../config/firebase');
const userCollection = db.collection('User');
module.exports.userController = {

  //Register user
  async registerUser(req, res) {
    
    const { Email, Password, UserName } = req.body;
    try {
      const userInfo = {
        // id: userCollection.doc(),
        Email,
        Password,
        UserName
      };
      //add validation here;

      const docRef = await userCollection.add(userInfo);

      res.status(200).send({
        id: docRef.id,
        status: 'success',
        message: 'Register user successfully',
        data: userInfo,
      });
    } catch (error) {
      res.status(500).json("this is error:"+ error.message + error);
    }
  },

  async login(req, res) {
    const { UserName, Password } = req.body;
    try {

      //add login with mail here;
      //handle password hashed
      const users = await userCollection
        .where("UserName", "==", UserName)
        .where("Password", "==", Password)
        .limit(1)
        .get();

      if (users.empty) {
        res.status(404).json("User not found or wrong password")
      }
      else {
        const userData = users.docs[0].data();
        const userInfo = {
          id: userData.id,
          Email: userData.Email,
          Password: userData.Password,
          UserName: userData.UserName
        };

        res.status(200).send({
          status: 'success',
          message: 'Login successfull',
          data: userInfo,
        });
      }
    } catch (error) {
      res.status(500).json(error.message);
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
          status: 'success',
          message: 'update user successfully'
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
        Password: user.Password,
        UserName: UserName
      };

      await userCollection.doc(id).update(userInfo);

      res.status(200).send({
        status: 'success',
        message: 'update user successfully',
        data: userInfo
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
        status: 'success',
        message: 'delete user successfully'
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  }

}