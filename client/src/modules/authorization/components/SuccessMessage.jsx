import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';

import { RouterMatchPropType } from 'common/constants/propTypes';
import { Routes } from 'common/constants/enums';
import AppLogo from 'common/components/AppLogo';

const SuccessMessage = ({ match: { path } }) => (
  <div className="success-message">
    <h1 className="success-message__heading">
      <AppLogo />
    </h1>
    <p className="success-message__message">
      <FormattedMessage
        id={
          path === `/${Routes.ACCOUNT_CREATED}`
            ? 'authorization.sign-up.result-success'
            : 'authorization.password-recovery-success'
        }
        values={{
          link: (
            <Link className="success-message__link" to="/">
              <FormattedMessage id="authorization.sign-up.result-link" />
            </Link>
          )
        }}
      />
    </p>
  </div>
);

SuccessMessage.propTypes = {
  match: RouterMatchPropType.isRequired
};

export default withRouter(SuccessMessage);