import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { injectIntl } from 'react-intl';
import _tail from 'lodash/tail';

import { ChevronRight } from 'assets/images/icons';
import { IntlPropType } from 'common/constants/propTypes';

const Breadcrumbs = ({ breadcrumbs, isGuest, intl: { formatMessage } }) => {
  if (breadcrumbs.length <= 1) {
    return null;
  }

  const restOfTheBreadcrumbs = _tail(breadcrumbs);
  const firstBreadcrumb = breadcrumbs[0];

  return (
    <div className="wrapper">
      <nav className="breadcrumbs">
        <ol
          className={classNames('breadcrumbs__list', {
            'breadcrumbs__list--cohort-disabled': isGuest
          })}
        >
          <li className="breadcrumbs__list-item">
            <Link to={`${firstBreadcrumb.path}`}>
              {formatMessage({
                id: `common.breadcrumbs.${firstBreadcrumb.name}`
              })}
            </Link>
          </li>
          <li className="breadcrumbs__list-item">
            <ChevronRight />
          </li>
          {restOfTheBreadcrumbs.map(breadcrumb => (
            <Fragment key={breadcrumb.name}>
              <li className="breadcrumbs__list-item">
                <Link to={`${breadcrumb.path}`}>{breadcrumb.name}</Link>
              </li>
              <li className="breadcrumbs__list-item">
                <ChevronRight />
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
};

Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.object),
  intl: IntlPropType.isRequired,
  isGuest: PropTypes.bool
};

export default injectIntl(Breadcrumbs);
