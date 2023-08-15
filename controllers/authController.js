const { db, query } = require("../database");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const nodemailer = require("../helpers/nodemailer");
const { OAuth2Client } = require("google-auth-library");

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const getEmailQuery = `SELECT * FROM user WHERE email=${db.escape(
        email
      )}`;

      const isEmailExist = await query(getEmailQuery);
      if (isEmailExist.length > 0) {
        return res.status(200).send({ message: "Email has been used" });
      }

      if (password.length < 8) {
        return res
          .status(200)
          .send({ message: "Password too short, minimal 8 characters" });
      }

      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(password, salt);

      const addUserQuery = `INSERT INTO user VALUES (null, ${db.escape(
        username
      )}, ${db.escape(email)}, ${db.escape(hashPassword)}, false, null, null)`;

      const user = await query(addUserQuery);

      const payload = { id: user.insertId };
      const token = jwt.sign(payload, process.env.JWT_KEY);

      let mail = {
        from: `Admin <${process.env.NODEMAILER_USER}>`,
        to: `${email}`,
        subject: `Verified your account!`,
        html: `
      <div>
      <p>Thanks for register, you need to activate your account,</p>
      <a href="${process.env.LINK_VERIFICATION}${token}">Click here</a>
      <span>to activate</span>
      </div>`,
      };

      await nodemailer.sendMail(mail);

      res.status(200).send({
        data: user,
        message: "Success register! Please verify your email",
      });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const isEmailExistQuery = `SELECT * FROM user WHERE email=${db.escape(
        email
      )};`;
      const isEmailExist = await query(isEmailExistQuery);

      if (isEmailExist.length === 0) {
        return res
          .status(400)
          .send({ message: "Email or password is invalid" });
      }

      if (isEmailExist[0].is_verified === 0) {
        return res
          .status(400)
          .send({ message: "Please verified your account!" });
      }

      if (isEmailExist[0].register_type === "Google") {
        return res
          .status(400)
          .send({ message: "Please login using Google Sign In" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        isEmailExist[0].password
      );

      if (!isPasswordValid) {
        return res
          .status(400)
          .send({ message: "Email or password is invalid" });
      }

      const payload = {
        id: isEmailExist[0].id_user,
        email: isEmailExist[0].email,
        username: isEmailExist[0].username,
        type: "user",
      };

      const token = jwt.sign(payload, process.env.JWT_KEY);

      return res.status(200).send({
        message: "Login success!",
        token,
        user: {
          idUser: isEmailExist[0].id_user,
          username: isEmailExist[0].username,
          email: isEmailExist[0].email,
        },
      });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  verificationUser: async (req, res) => {
    try {
      const idUser = req.user.id;

      const getUser = await query(
        `SELECT * FROM user WHERE id_user=${idUser};`
      );

      if (getUser.length === 0) {
        return res.status(400).send({ message: "User is not found" });
      }

      if (getUser[0].is_verified) {
        return res
          .status(200)
          .send({ message: "Your account is already active. Please log in!" });
      }

      const updateIsVerified = await query(
        `UPDATE user SET is_verified=true WHERE id_user=${idUser};`
      );

      return res
        .status(200)
        .send({ message: "Account is verified. Please log in to continue!" });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  sendLinkForgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const isUserExist = await query(
        `SELECT * FROM user WHERE email=${db.escape(email)}`
      );

      if (isUserExist.length === 0) {
        return res.status(400).send({ message: "Email is no found!" });
      }

      const payload = { id: isUserExist[0].id_user };
      const token = jwt.sign(payload, process.env.JWT_KEY);

      let mail = {
        from: `Admin <${process.env.NODEMAILER_USER}>`,
        to: `${email}`,
        subject: `Link to change your password!`,
        html: `
        <div>
          <p>Click link below to reset your password</p>
          <a href="${process.env.LINK_RESET_PASSWORD}${token}">Reset Password</a>
        </div>`,
      };

      await nodemailer.sendMail(mail);

      return res.status(200).send({
        message: "Link to change password has been sent to your email!",
      });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const idUser = req.user.id;

      const isUserExist = await query(
        `SELECT * FROM user WHERE id_user=${idUser};`
      );

      if (isUserExist.length === 0) {
        return res.status(400).send({ message: "User is not found!" });
      }

      if (oldPassword) {
        const isPasswordValid = await bcrypt.compare(
          oldPassword,
          isUserExist[0].password
        );

        if (!isPasswordValid) {
          return res
            .status(400)
            .send({ message: "Current password is invalid!" });
        }
      }

      const isNewPasswordSame = await bcrypt.compare(
        newPassword,
        isUserExist[0].password
      );

      if (isNewPasswordSame) {
        return res.status(400).send({
          message: "New password must not same with previous password",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);

      const changePassword = await query(
        `UPDATE user SET password=${db.escape(
          hashPassword
        )} WHERE id_user=${idUser};`
      );

      return res
        .status(200)
        .send({ message: "Change password success! Please log in again" });
    } catch (error) {
      return res.status(200).send({ message: error });
    }
  },
  verifyGoogleSignIn: async (req, res) => {
    try {
      const token = req.headers.token;
      const client = new OAuth2Client();

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userid = payload["sub"];

      const isEmailExist = await query(
        `SELECT * FROM user WHERE email=${db.escape(payload.email)}`
      );

      if (isEmailExist.length > 0) {
        if (isEmailExist[0].register_type !== "Google") {
          return res.status(400).send({
            message:
              "Your account already registered with email, please input valid email and password in the form",
          });
        }

        const payloadJwt = {
          id: isEmailExist[0].id_user,
          email: isEmailExist[0].email,
          username: isEmailExist[0].username,
          type: "user",
        };

        const tokenJwt = jwt.sign(payloadJwt, process.env.JWT_KEY);

        return res.status(200).send({
          message: "Login success!",
          token: tokenJwt,
          user: {
            idUser: isEmailExist[0].id_user,
            username: isEmailExist[0].username,
            email: isEmailExist[0].email,
          },
        });
      } else {
        const username = payload.given_name;
        const email = payload.email;
        const registerType = "Google";

        const addUserQuery = await query(
          `INSERT INTO user VALUES (null, ${db.escape(username)}, ${db.escape(
            email
          )}, null, true, null, ${db.escape(registerType)});`
        );

        const payloadJwt = {
          id: addUserQuery.insertId,
          email,
          username,
          type: "user",
        };

        const tokenJwt = jwt.sign(payloadJwt, process.env.JWT_KEY);

        return res.status(200).send({
          message: "Login success!",
          token: tokenJwt,
          user: {
            idUser: addUserQuery.insertId,
            username,
            email,
          },
        });
      }
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
};
