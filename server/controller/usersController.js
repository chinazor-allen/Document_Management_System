require('dotenv').config();
import db from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonWebToken';
import helper from '../controller/helpers/helper';

const secretKey = process.env.SECRET;


class userController{
  static login(req, res) {
    db.User.findOne({ where: {username : req.body.username} })
    .then((user) => {
      if (bcrypt.compareSync(req.body.password, user.password_digest)){
        const loginObject = {
          userId: user.id,
        username: user.username
      };
      const token =jwt.sign(loginObject, secretKey, {expiresIn:'24h'});
      user = helper.transformUser(user);
        res.status(200).json({ msg: 'Login Successful', token, user});
      } else {
        res.status(500).json({error: 'Login Failed'});
      }
    });
  }

  static logout(req, res) {

  }

  static createUser(req, res){
    let newUser = {};
    newUser.roleId = req.body.roleId;
    newUser.username = req.body.username;
    newUser.firstname = req.body.firstname;
    newUser.lastname = req.body.lastname;
    newUser.email = req.body.email;
    newUser.password = req.body.password;
    newUser.password_confirmation = req.body.password_confirmation;

    db.User.create(newUser)
    .then((user) => {
      const userObject = {
        username: user.username,
        roleId: user.roleId,
        userId: user.id
      };
      const token =jwt.sign(userObject, secretKey, {expiresIn:'24h'});
      user = helper.transformUser(user);
       res.status(201)
        .json({ msg: 'User successfully created', token,  user });
     })
    .catch((err) => {
       res.status(500).json({error: err.message});
     });

  }

  static instanceUsers(req, res){
    db.User.findAll()
    .then((user) => {

      res.status(200).json({ msg: user});
    })
    .catch((err) => {
      res.status(500).json({error: err.message});
    });

  }

  static findUser(req, res) {
    db.User.findOne({ where: { id: req.params.id } })
    .then((user) => {
      if (user) {
        res.status(200).json({ msg: user });
      } else {
        res.status(500).json({ error: "User does not exist in the database"});
      }
    }).catch((err) => {
      res.status(500).json({ msg: err.message });
    });
  }

  static updateUser(req, res) {
    db.User.findOne({ where: { id: req.params.id } })
    .then((user) => {
      user.fullName = req.body.fullName;
      user.password = req.body.password;
      user.save().then(() => {
        res.status(200).json({ msg: 'User updated' });
      }).catch((err) => {
        res.status(500).json({ error: err.message });
      });
    });
  }

  static deleteUser(req, res){
    db.User.findOne({ where: { id: req.params.id } })
      .then((user) => {
        if (!user) {
          res.status(200).json({ msg: `User ${req.params.id} not found` });
        }
        User.destroy({ where: { id: req.params.id } })
          .then((user) => {
            res.status(201).json({ msg: 'User deleted' });
          });
      });
  }

  static findAllDocument(req, res){
    db.User.findOne({ where: { id: req.params.id }})
    .then((user) => {
      user.getDocuments().then((documents) => {
        res.status(200).json({ msg: documents});
      });
    })
    .catch((err) => {
      res.status(404).json({ msg: err.message})
    });
  }
}

export default userController;