const sanitize = require('mongo-sanitize');
const validator = require('validator');
const _some = require('lodash/some');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const _trim = require('lodash/trim');
const _forEach = require('lodash/forEach');

const BadRequestException = require('../common/exceptions/BadRequestException');
const NotFoundException = require('../common/exceptions/NotFoundException');
const User = require('../models/user.model');
const {
  responseWithUserData,
  validatePassword
} = require('../common/utils/userUtils');
const Settings = require('../models/settings.model');

const sendUser = (req, resp) => {
  return resp.send(responseWithUserData(req.user));
};

const logout = (req, resp) => {
  req.session.destroy(() => {
    req.logout();

    resp.clearCookie('connect.sid');
    resp.redirect('/');
  });
};

const signUp = (req, resp, next) => {
  const { email, password, passwordConfirm, username } = req.body;
  const sanitizedEmail = sanitize(email);
  const sanitizedUsername = sanitize(username);
  const errors = {};
  const { isEmail, isLength } = validator;

  if (!isLength(sanitizedUsername, { min: 1, max: 32 })) {
    errors.nameError = true;
  }

  if (!isEmail(sanitizedEmail)) {
    errors.emailError = true;
  }

  if (!validatePassword(password)) {
    errors.passwordError = true;
  }

  if (password !== passwordConfirm) {
    errors.confirmPasswordError = true;
  }

  if (_some(errors, error => error !== undefined)) {
    return resp.status(406).send(errors);
  }

  User.findOne({ email: sanitizedEmail })
    .exec()
    .then(user => {
      if (user) {
        const { _id, displayName, email, idFromProvider, isActive } = user;

        if (!idFromProvider && !isActive) {
          const hashedPassword = bcrypt.hashSync(password + email, 12);
          const signUpHash = crypto.randomBytes(32).toString('hex');
          const expirationDate = new Date().getTime() + 3600000;

          return User.findOneAndUpdate(
            { _id },
            {
              displayName: sanitizedUsername,
              password: hashedPassword,
              signUpHash,
              signUpHashExpirationDate: expirationDate
            }
          )
            .exec()
            .then(user => {
              if (!user) {
                throw new Error();
              }

              return { displayName, email, signUpHash };
            });
        }

        throw new BadRequestException(
          'user.actions.sign-up.user-already-exist'
        );
      }

      const hashedPassword = bcrypt.hashSync(password + email, 12);
      const signUpHash = crypto.randomBytes(32).toString('hex');
      const expirationDate = new Date().getTime() + 3600000;
      const newUser = new User({
        displayName: sanitizedUsername,
        email: sanitizedEmail,
        isActive: false,
        password: hashedPassword,
        settings: new Settings(),
        signUpHash,
        signUpHashExpirationDate: expirationDate
      });

      return newUser.save().then(user => {
        const { displayName, email, signUpHash } = user;

        return { displayName, email, signUpHash };
      });
    })
    .then(dataToSend => {
      // eslint-disable-next-line no-param-reassign
      resp.locals = dataToSend;

      return next();
    })
    .catch(err => {
      if (err instanceof BadRequestException) {
        const { message } = err;

        return resp.status(400).send({ message });
      }

      resp.sendStatus(400);
    });
};

const confirmEmail = (req, resp) => {
  const { hash: signUpHash } = req.params;

  User.findOneAndUpdate(
    {
      signUpHash,
      signUpHashExpirationDate: { $gte: new Date() }
    },
    {
      activatedAt: new Date(),
      isActive: true,
      signUpHash: null,
      signUpHashExpirationDate: null
    }
  )
    .lean()
    .exec()
    .then(user => {
      if (!user) {
        throw new Error();
      }
      resp.redirect('/account-created');
    })
    .catch(() => resp.redirect(`/confirmation-link-expired/${signUpHash}`));
};

const resendSignUpConfirmationLink = (req, resp, next) => {
  const { hash } = req.body;
  const sanitizedHash = sanitize(hash);

  User.findOneAndUpdate(
    {
      signUpHash: sanitizedHash,
      isActive: false
    },
    {
      signUpHash: crypto.randomBytes(32).toString('hex'),
      signUpHashExpirationDate: new Date().getTime() + 3600000
    },
    { new: true }
  )
    .lean()
    .exec()
    .then(user => {
      if (!user) {
        throw new Error();
      }

      const { displayName, email, signUpHash } = user;

      // eslint-disable-next-line no-param-reassign
      resp.locals = { displayName, email, signUpHash };

      next();
    })
    .catch(() => resp.sendStatus(400));
};

const getLoggedUser = (req, resp) => {
  if (req.user) {
    return resp.send(responseWithUserData(req.user));
  }

  return resp.sendStatus(204);
};

const resetPassword = (req, resp, next) => {
  const { email } = req.body;
  const sanitizedEmail = sanitize(email);
  const { isEmail } = validator;

  if (!isEmail(sanitizedEmail)) {
    return resp.sendStatus(406);
  }

  User.findOne({ email: sanitizedEmail })
    .exec()
    .then(user => {
      if (!user) {
        return resp.send();
      }

      const { displayName, isActive, idFromProvider } = user;

      if (!idFromProvider && !isActive) {
        return resp.send();
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpirationDate = new Date().getTime() + 3600000;

      return User.findOneAndUpdate(
        {
          email: sanitizedEmail
        },
        { resetToken, resetTokenExpirationDate }
      )
        .exec()
        .then(() => {
          // eslint-disable-next-line no-param-reassign
          resp.locales = {
            displayName,
            email,
            resetToken
          };

          next();
        });
    })
    .catch(() => resp.sendStatus(400));
};

const recoveryPassword = (req, resp) => {
  const { token: resetToken } = req.params;

  User.findOne({
    resetToken,
    resetTokenExpirationDate: { $gte: new Date() }
  })
    .lean()
    .exec()
    .then(user => {
      if (!user) {
        throw new Error();
      }
      resp.redirect(`/password-recovery/${resetToken}`);
    })
    .catch(() => resp.redirect(`/recovery-link-expired/${resetToken}`));
};

const updatePassword = (req, resp) => {
  const { password: updatedPassword, passwordConfirmation } = req.body;
  const { token } = req.params;

  const sanitizedToken = sanitize(token);
  const trimmedPassword = _trim(updatedPassword);
  const trimmedPasswordConfirmation = _trim(passwordConfirmation);

  if (
    !validatePassword(updatedPassword) ||
    trimmedPassword !== trimmedPasswordConfirmation
  ) {
    return resp.sendStatus(400);
  }

  User.findOne({ resetToken: sanitizedToken })
    .exec()
    .then(user => {
      if (!user) {
        throw new Error();
      }

      const {
        createdAt,
        email,
        idFromProvider,
        isActive,
        resetTokenExpirationDate
      } = user;
      const now = new Date().getTime();

      if (resetTokenExpirationDate < now) {
        resp.redirect(`/recovery-link-expired/${token}`);

        throw new Error();
      }

      const dataUpdate = {
        password: bcrypt.hashSync(updatedPassword + email, 12),
        resetToken: null,
        resetTokenExpirationDate: null
      };

      if (idFromProvider && !isActive) {
        dataUpdate.activatedAt = createdAt;
        dataUpdate.isActive = true;
      }

      return User.findOneAndUpdate(
        { resetToken: sanitizedToken },
        dataUpdate
      ).exec();
    })
    .then(() => resp.sendStatus(200))
    .catch(err => {
      if (err instanceof BadRequestException) {
        const { message } = err;

        resp.status(400).send({ message });
      }

      resp.sendStatus(400);
    });
};

const resendRecoveryLink = (req, resp, next) => {
  const { token } = req.params;
  const sanitizedToken = sanitize(token);
  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpirationDate = new Date().getTime() + 3600000;

  User.findOneAndUpdate(
    {
      resetToken: sanitizedToken
    },
    {
      resetToken: newToken,
      resetTokenExpirationDate: newExpirationDate
    }
  )
    .lean()
    .exec()
    .then(user => {
      if (!user) {
        throw new Error('user.actions.reset');
      }
      const { isActive } = user;

      if (!isActive) {
        throw new Error();
      }

      const { displayName, email } = user;

      // eslint-disable-next-line no-param-reassign
      resp.locales = {
        displayName,
        email,
        resetToken: newToken
      };

      next();
    })
    .catch(err => {
      const { message } = err;

      if (message) {
        return resp.status(400).send({ message });
      }

      resp.sendStatus(400);
    });
};

const getUserDetails = (req, resp) => {
  const { user } = req;

  if (user) {
    const { activatedAt, createdAt, email, password } = user;
    const activationDate = activatedAt || createdAt;
    const isPasswordSet = password !== undefined;

    return resp.send({ activationDate, email, isPasswordSet });
  }

  return resp.sendStatus(400);
};

const changePassword = (req, res) => {
  const { password, newPassword, newPasswordConfirm } = req.body;
  const errors = {};
  const { email } = req.user;

  errors.isNewPasswordError = !validatePassword(newPassword);
  errors.isNewConfirmPasswordError = newPassword !== newPasswordConfirm;

  if (_some(errors, error => error)) {
    return res.status(400).send(errors);
  }

  User.findOne({ email }, 'password')
    .exec()
    .then(doc => {
      if (!doc) {
        throw new Error();
      }

      const { password: dbPassword } = doc;

      if (bcrypt.compareSync(password + email, dbPassword)) {
        const newHashedPassword = bcrypt.hashSync(newPassword + email, 12);

        // eslint-disable-next-line no-param-reassign
        doc.password = newHashedPassword;

        return doc.save();
      }
    })
    .then(() => res.send())
    .catch(() => res.sendStatus(400));
};

const updateSettings = (req, res) => {
  const { settings: editedSettings } = req.body;
  const {
    user: { _id: userId }
  } = req;

  User.findById(userId)
    .exec()
    .then(doc => {
      if (!doc) {
        throw new NotFoundException();
      }

      const { settings } = doc;

      _forEach(editedSettings, (value, key) => {
        if (settings[key]) {
          settings[key] = sanitize(value);
        }
      });

      return doc.save();
    })
    .then(() => res.send())
    .catch(() => res.sendStatus(400));
};

module.exports = {
  changePassword,
  confirmEmail,
  getLoggedUser,
  getUserDetails,
  logout,
  recoveryPassword,
  resendRecoveryLink,
  resendSignUpConfirmationLink,
  resetPassword,
  sendUser,
  signUp,
  updatePassword,
  updateSettings
};
