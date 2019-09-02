import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import PendingButton from 'common/components/PendingButton';
import { PreloaderTheme } from 'common/components/Preloader';

const Confirmation = ({
  children,
  className,
  disabled,
  onCancel,
  onConfirm,
  title
}) => (
  <div className={classNames('confirmation', { className })}>
    <h4>{title || children}</h4>
    <PendingButton
      className="primary-button"
      disabled={disabled}
      onClick={onConfirm}
      preloaderTheme={PreloaderTheme.LIGHT}
      type="button"
    >
      <FormattedMessage id="common.button.confirm" />
    </PendingButton>
    <button
      className="primary-button"
      disabled={disabled}
      onClick={onCancel}
      type="button"
    >
      <FormattedMessage id="common.button.cancel" />
    </button>
  </div>
);

Confirmation.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,

  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default Confirmation;
