import React, { PureComponent } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import validator from 'validator';
import { connect } from 'react-redux';
import _flowRight from 'lodash/flowRight';
import { Link } from 'react-router-dom';

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
    signInErrorId: ''
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
    const { signInErrorId } = this.state;
    const error = isValid ? '' : signInErrorId;

    this.setState({
      email,
      isEmailValid: isValid,
      signInErrorId: error
    });
  };

  onPasswordChange = (password, isValid) => {
    const { signInErrorId } = this.state;
    const error = isValid ? '' : signInErrorId;

    this.setState(
      {
        password,
        isPasswordValid: isValid,
        signInErrorId: error
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
    const { isEmailValid, isPasswordValid, signInErrorId } = this.state;

    return this.setState({
      isFormValid: isEmailValid && isPasswordValid && !signInErrorId
    });
  };

  handleSignIn = event => {
    event.preventDefault();
    const { email, password } = this.state;
    const { signIn } = this.props;

    this.setState({ pending: true });
    this.pendingPromise = makeAbortablePromise(signIn(email, password));

    return this.pendingPromise.promise
      .then(() => this.setState({ pending: false }))
      .catch(err => {
        if (!(err instanceof AbortPromiseException)) {
          const newState = { pending: false };

          if (err instanceof UnauthorizedException) {
            newState.signInErrorId =
              'authorization.actions.sign-in.invalid-credentials';
          } else {
            newState.signInErrorId = 'common.something-went-wrong';
          }

          this.setState(newState);
        }
      });
  };

  renderSignInError = () => {
    const { signInErrorId } = this.state;
    const {
      intl: { formatMessage }
    } = this.props;

    return (
      <p className="sign-in__error">
        <FormattedMessage
          id={signInErrorId}
          values={{
            link: (
              <Link className="sign-in__link" to="/reset-password">
                {formatMessage({ id: 'authorization.forgot-password' })}
              </Link>
            )
          }}
        />
      </p>
    );
  };

  renderForgotPassword = () => {
    const {
      intl: { formatMessage }
    } = this.props;

    return (
      <p className="sign-in__forgot-password">
        <FormattedMessage
          id="authorization.forgot-password.question"
          values={{
            link: (
              <Link className="sign-in__link" to="/reset-password">
                {formatMessage({ id: 'authorization.forgot-password' })}
              </Link>
            )
          }}
        />
      </p>
    );
  };

  render() {
    const { isFormValid, pending, signInErrorId } = this.state;
    const { onCancel } = this.props;
    const hasSignUpFailed = signInErrorId.length > 0;

    return (
      <div className="sign-in">
        <h1 className="sign-in__heading">
          <FormattedMessage id="authorization.auth-box.sign-in" />
        </h1>
        {signInErrorId && this.renderSignInError()}
        <form
          className="sign-in__form"
          noValidate
          onSubmit={isFormValid && !pending ? this.handleSignIn : null}
        >
          <AuthInput
            disabled={pending}
            focus
            formError={hasSignUpFailed}
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
            noSuccessTheme
            onChange={this.onPasswordChange}
            type="password"
          />
          <div className="sign-in__buttons">
            <button
              className="primary-button"
              disabled={pending}
              onClick={onCancel}
              type="button"
            >
              <FormattedMessage id="common.button.cancel" />
            </button>
            <PendingButton
              className="primary-button sign-in__confirm"
              disabled={!isFormValid}
              onClick={this.handleSignIn}
              type="submit"
            >
              <FormattedMessage id="authorization.sign-in" />
            </PendingButton>
          </div>
        </form>
        {this.renderForgotPassword()}
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