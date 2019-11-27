import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedDate, FormattedMessage, FormattedTime } from 'react-intl';
import classNames from 'classnames';

import Avatar from 'common/components/Avatar';
import { getCurrentUser } from 'modules/user/model/selectors';
import { UserPropType } from 'common/constants/propTypes';
import { AbortPromiseException } from 'common/exceptions/AbortPromiseException';
import { makeAbortablePromise } from 'common/utils/helpers';
import Preloader from 'common/components/Preloader';
import { fetchUserDetails } from 'modules/user/model/actions';
import PasswordChangeForm from 'modules/user/AuthBox/components/PasswordChangeForm';
import UserProfileHeader from './UserProfileHeader';
import DeleteAccount from './DeleteAccount';
import EmailReports from './EmailReports';
import { KeyCodes } from 'common/constants/enums';
import './UserProfile.scss';

class UserProfile extends PureComponent {
  pendingPromise = null;

  constructor(props) {
    super(props);

    const {
      currentUser: { name }
    } = this.props;

    this.state = {
      isNameInputVisible: false,
      isNameUpdated: false,
      isPasswordUpdateFormVisible: false,
      pending: false,
      userName: name
    };

    this.nameInput = createRef();
  }

  componentDidMount() {
    this.handleFetchUserDetails();
  }

  componentDidUpdate(prevProps) {
    const {
      currentUser: { name }
    } = prevProps;

    this.isNameUpdated(name);
  }

  componentWillUnmount() {
    if (this.pendingPromise) {
      this.pendingPromise.abort();
    }
  }

  isNameUpdated = previousName => {
    const { userName } = this.state;

    if (userName !== previousName) {
      return this.setState({ isNameUpdated: true });
    }

    this.setState({ isNameUpdated: false });
  };

  handleFetchUserDetails = () => {
    const { fetchUserDetails } = this.props;

    this.setState({ pending: true });
    this.pendingPromise = makeAbortablePromise(fetchUserDetails());
    this.pendingPromise.promise
      .then(() => this.setState({ pending: false }))
      .catch(err => {
        if (!(err instanceof AbortPromiseException)) {
          this.setState({ pending: false });
        }
      });
  };

  handleEscapePress = event => {
    const { code } = event;

    if (code === KeyCodes.ESCAPE) {
      this.nameInput.current.blur();
    }
  };

  handlePasswordChangeVisibility = event => {
    event.preventDefault();
    this.setState(({ isPasswordUpdateFormVisible }) => ({
      isPasswordUpdateFormVisible: !isPasswordUpdateFormVisible
    }));
  };

  handleNameChange = event => {
    const {
      target: { value }
    } = event;

    this.setState({ userName: value });
  };

  handleNameUpdate = () => {
    const { isNameUpdated } = this.state;

    // call api

    if (isNameUpdated) {
      // call API to update the name here
    }
  };

  handleFocus = () =>
    document.addEventListener('keydown', this.handleEscapePress);

  handleBlur = () => {
    document.removeEventListener('keydown', this.handleEscapePress);

    this.handleNameUpdate();
  };

  renderPersonalInfo = () => {
    const {
      currentUser: { avatarUrl, name }
    } = this.props;
    const { isNameInputVisible, userName } = this.state;

    return (
      <section className="user-profile__data-container">
        <h2 className="user-profile__data-header">
          <FormattedMessage id="user.profile.personal-info" />
        </h2>
        <ul className="user-profile__data-list">
          <li className="user-profile__data-item  user-profile__photo">
            <span className="user-profile__data-name">
              <FormattedMessage id="user.photo" />
            </span>
            <span className="user-profile__data-value">
              <Avatar
                avatarUrl={avatarUrl}
                className="user-profile__avatar"
                name={name}
              />
            </span>
          </li>
          <li className="user-profile__data-item">
            <span className="user-profile__data-name">
              <FormattedMessage id="user.name" />
            </span>
            <span className="user-profile__data-name-wrapper">
              <span className="user-profile__data-value">
                <input
                  className={classNames('primary-input', {
                    'user-profile__name-field--focused': isNameInputVisible,
                    'user-profile__name-field': !isNameInputVisible
                  })}
                  onBlur={this.handleBlur}
                  onChange={this.handleNameChange}
                  onFocus={this.handleFocus}
                  ref={this.nameInput}
                  type="text"
                  value={userName}
                />
              </span>
            </span>
          </li>
        </ul>
      </section>
    );
  };

  renderContactInfo = () => {
    const {
      currentUser: { email }
    } = this.props;

    return (
      <section className="user-profile__data-container">
        <h2 className="user-profile__data-header">
          <FormattedMessage id="user.profile.contact-info" />
        </h2>
        <ul className="user-profile__data-list">
          <li className="user-profile__data-item">
            <span className="user-profile__data-name">
              <FormattedMessage id="user.email" />
            </span>
            <span className="user-profile__data-value">{email}</span>
          </li>
        </ul>
      </section>
    );
  };

  renderAccountInfo = () => {
    const {
      currentUser: { activationDate, isPasswordSet }
    } = this.props;
    const { isPasswordUpdateFormVisible } = this.state;
    const passwordTitleId = isPasswordUpdateFormVisible
      ? 'user.profile.change-password'
      : 'user.password';

    return (
      <section className="user-profile__data-container">
        <h2 className="user-profile__data-header">
          <FormattedMessage id="user.profile.account" />
        </h2>
        <ul className="user-profile__data-list">
          {isPasswordSet && (
            <>
              <li
                className={classNames(
                  'user-profile__data-item user-profile__data-item--clickable',
                  {
                    'user-profile__data-item--clickable--form-visible': isPasswordUpdateFormVisible,
                    'user-profile__data-item--clickable--form-not-visible': !isPasswordUpdateFormVisible
                  }
                )}
                onClick={this.handlePasswordChangeVisibility}
              >
                <span className="user-profile__data-name">
                  <FormattedMessage id={passwordTitleId} />
                </span>
                {!isPasswordUpdateFormVisible && (
                  <span className="user-profile__data-value">
                    &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                  </span>
                )}
              </li>
              {isPasswordUpdateFormVisible && (
                <li className="user-profile__update-password">
                  <PasswordChangeForm
                    onCancel={this.handlePasswordChangeVisibility}
                  />
                </li>
              )}
            </>
          )}
          <li className="user-profile__data-item">
            <span className="user-profile__data-name">
              <FormattedMessage id="user.profile.account-activation" />
            </span>
            <span className="user-profile__data-value">
              {activationDate && (
                <FormattedMessage
                  id="user.profile.account-activation-date"
                  values={{
                    date: (
                      <FormattedDate
                        value={activationDate}
                        year="numeric"
                        month="long"
                        day="2-digit"
                      />
                    ),
                    time: <FormattedTime value={activationDate} />
                  }}
                />
              )}
            </span>
          </li>
        </ul>
      </section>
    );
  };

  render() {
    const { pending } = this.state;
    const {
      currentUser,
      currentUser: { avatarUrl, name, email }
    } = this.props;
    const isPendingPreloaderVisible = pending && !email;

    if (!email) {
      return <Preloader />;
    }

    return (
      <div className="wrapper">
        <article className="user-profile">
          <UserProfileHeader avatarUrl={avatarUrl} name={name} />
          {this.renderPersonalInfo()}
          {this.renderContactInfo()}
          {this.renderAccountInfo()}
          <EmailReports user={currentUser} />
          <DeleteAccount user={currentUser} />
          {isPendingPreloaderVisible && <Preloader />}
        </article>
      </div>
    );
  }
}

UserProfile.propTypes = {
  currentUser: UserPropType.isRequired,

  fetchUserDetails: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state)
});

export default connect(mapStateToProps, { fetchUserDetails })(UserProfile);
