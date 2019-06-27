import React, { PureComponent } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import validator from 'validator';
import { connect } from 'react-redux';
import _flowRight from 'lodash/flowRight';

import AuthInput from './AuthInput';
import { signIn } from 'modules/authorization/model/actions';
import PendingButton from 'common/components/PendingButton';
import { AbortPromiseException } from 'common/exceptions/AbortPromiseException';
import { makeAbortablePromise } from 'common/utils/helpers';
import { UnauthorizedException } from 'common/exceptions/UnauthorizedException';
import { IntlPropType } from 'common/constants/propTypes';

class SignInForm extends PureComponent {
  pendingPromise = null;

  state = {
    email: '',
    isEmailValid: false,
    isFormValid: false,
    isPasswordValid: false,
    password: '',
    pending: false,
    signUpErrorId: ''
  };

  componentDidUpdate() {
    this.isFormValid();
  }

  componentWillUnmount() {
    if (this.pendingPromise) {
      this.pendingPromise.abort();
    }
  }

  onEmailChange = (email, isValid) => {
    const { signUpErrorId } = this.state;
    const error = isValid ? '' : signUpErrorId;
    this.setState({
      email,
      isEmailValid: isValid,
      signUpErrorId: error
    });
  };

  onPasswordChange = (password, isValid) => {
    const { signUpErrorId } = this.state;
    const error = isValid ? '' : signUpErrorId;
    this.setState(
      {
        password,
        isPasswordValid: isValid,
        signUpErrorId: error
      },
      this.comparePasswords
    );
  };

  emailValidator = value => {
    const { isEmail } = validator;

    if (!isEmail(value)) {
      return 'authorization.input.email.invalid';
    }

    return '';
  };

  isFormValid = () => {
    const { isEmailValid, isPasswordValid, signUpErrorId } = this.state;

    return this.setState({
      isFormValid: isEmailValid && isPasswordValid && !signUpErrorId
    });
  };

  handleSignIn = () => {
    const { email, password } = this.state;
    const { signIn } = this.props;

    this.setState({ pending: true });

    this.pendingPromise = makeAbortablePromise(signIn(email, password));

    return this.pendingPromise.promise
      .then(() => this.setState({ pending: true }))
      .catch(err => {
        if (!(err instanceof AbortPromiseException)) {
          const newState = { pending: false };

          if (err instanceof UnauthorizedException) {
            newState.signUpErrorId =
              'authorization.actions.sign-in.invalid-credentials';
          } else {
            newState.signUpErrorId = 'common.something-went-wrong';
          }

          this.setState(newState);
        }
      });
  };

  renderSignUpError = () => {
    const { signInErrorId } = this.state;
    const {
      intl: { formatMessage }
    } = this.props;
    const message = `${formatMessage({ id: signInErrorId })} ${formatMessage({
      id: 'common.try-again'
    })}`;

    return <p className="sign-in-form__error">{message}</p>;
  };

  render() {
    const { isFormValid, pending, signUpErrorId } = this.state;
    const { onCancel } = this.props;
    const hasSignUpFailed = signUpErrorId !== '';

    return (
      <div className="sign-in">
        <h1 className="sign-in-form__heading">
          <FormattedMessage id="authorization.auth-box.sign-in" />
        </h1>
        {signUpErrorId && this.renderSignUpError()}
        <form className="sign-in-form__form" noValidate>
          <AuthInput
            disabled={pending}
            formError={hasSignUpFailed}
            focus
            labelId="authorization.input.email.label"
            name="email"
            onChange={this.onEmailChange}
            type="text"
            validator={this.emailValidator}
          />
          <AuthInput
            disabled={pending}
            formError={hasSignUpFailed}
            labelId="authorization.input.password.label"
            name="password"
            onChange={this.onPasswordChange}
            type="password"
          />
          <div className="sign-in-form__buttons">
            <button
              className="primary-button"
              disabled={pending}
              onClick={onCancel}
              type="button"
            >
              <FormattedMessage id="common.button.cancel" />
            </button>
            <PendingButton
              className="primary-button sign-in-form__confirm"
              disabled={!isFormValid}
              onClick={this.handleSignIn}
              type="button"
            >
              <FormattedMessage id="authorization.sign-in" />
            </PendingButton>
          </div>
        </form>
      </div>
    );
  }
}

SignInForm.propTypes = {
  intl: IntlPropType.isRequired,

  onCancel: PropTypes.func.isRequired,
  signIn: PropTypes.func.isRequired
};

export default _flowRight(
  injectIntl,
  connect(
    null,
    { signIn }
  )
)(SignInForm);
