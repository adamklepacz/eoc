import React, { Fragment, PureComponent } from 'react';
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

class UserProfile extends PureComponent {
  pendingPromise = null;

  state = {
    isPasswordUpdateFormVisible: false,
    pending: false
  };

  componentDidMount() {
    this.handleFetchUserDetails();
  }

  componentWillUnmount() {
    if (this.pendingPromise) {
      this.pendingPromise.abort();
    }
  }

  handleFetchUserDetails = () => {
    const {
      currentUser: { name },
      fetchUserDetails
    } = this.props;

    this.setState({ pending: true });
    this.pendingPromise = makeAbortablePromise(fetchUserDetails(name));
    this.pendingPromise.promise
      .then(() => this.setState({ pending: false }))
      .catch(err => {
        if (!(err instanceof AbortPromiseException)) {
          this.setState({ pending: false });
        }
      });
  };

  handlePasswordChangeVisibility = event => {
    event.preventDefault();

    this.setState(({ isPasswordUpdateFormVisible }) => ({
      isPasswordUpdateFormVisible: !isPasswordUpdateFormVisible
    }));
  };

  renderHeader = () => {
    const {
      currentUser: { avatarUrl, name }
    } = this.props;

    return (
      <h1 className="user-profile__header">
        <span>
          <Avatar
            avatarUrl={avatarUrl}
            className="user-profile__header__avatar"
            name={name}
          />
        </span>
        {name}
      </h1>
    );
  };

  renderPersonalInfo = () => {
    const {
      currentUser: { avatarUrl, name }
    } = this.props;

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
            <span className="user-profile__data-value">{name}</span>
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
      currentUser: { activationDate }
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
          <li className="user-profile__data-item">
            <span className="user-profile__data-name">
              <FormattedMessage id="user.profile.account-activation" />
            </span>
            <span className="user-profile__data-value">
              {activationDate && (
                <Fragment>
                  <FormattedDate
                    value={activationDate}
                    year="numeric"
                    month="long"
                    day="2-digit"
                  />
                  {' at '}
                  <FormattedTime value={activationDate} />
                </Fragment>
              )}
            </span>
          </li>
        </ul>
      </section>
    );
  };

  render() {
    const { pending } = this.state;

    return (
      <div className="wrapper">
        <article className="user-profile">
          {this.renderHeader()}
          {this.renderPersonalInfo()}
          {this.renderContactInfo()}
          {this.renderAccountInfo()}
          {pending && <Preloader />}
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

export default connect(
  mapStateToProps,
  { fetchUserDetails }
)(UserProfile);
