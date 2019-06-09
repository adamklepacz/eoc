import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { dateFromString } from 'common/utils/helpers';
import UserIconPlaceholder from 'assets/images/user.svg';
import { UserIcon } from 'assets/images/icons';

class Activity extends PureComponent {
  state = {
    isAvatarError: false
  };

  handleAvatarError = () => this.setState({ isAvatarError: true });

  renderCohortInfo = () => {
    const {
      activity: { cohort }
    } = this.props;

    if (cohort) {
      const { cohortId, cohortName } = cohort;
      return (
        <Fragment>
          {' in '}
          <Link className="activity__link" to={`/cohort/${cohortId}`}>
            {cohortName}
          </Link>
          {' cohort'}
        </Fragment>
      );
    }
  };

  render() {
    const {
      activity: {
        actor: { actorAvatarUrl, actorName },
        createdAt,
        item: { itemName },
        list: { listId, listName }
      }
    } = this.props;
    const { isAvatarError } = this.state;
    const date = dateFromString(createdAt);

    return (
      <div className="activity">
        <div
          className={classNames('activity__avatar', {
            'activity--avatar--error': isAvatarError
          })}
        >
          {actorAvatarUrl ? (
            <img
              alt={`${actorName || 'user'} avatar`}
              className="activity__image"
              onError={this.handleAvatarError}
              src={isAvatarError ? UserIconPlaceholder : actorAvatarUrl}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div className="activity__message">
          <p className="activity__action">
            {`${actorName} added ${itemName ? `"${itemName}"` : ''} item to `}
            <Link className="activity__link" to={`/sack/${listId}`}>
              {listName}
            </Link>
            {' sack'}
            {this.renderCohortInfo()}
            {'.'}
          </p>
          <p className="activity__date">{date}</p>
        </div>
      </div>
    );
  }
}

Activity.propTypes = {
  activity: PropTypes.shape({
    activityType: PropTypes.string.isRequired,
    actor: PropTypes.objectOf(PropTypes.string).isRequired,
    cohort: PropTypes.objectOf(PropTypes.string),
    createdAt: PropTypes.string.isRequired,
    item: PropTypes.objectOf(PropTypes.string).isRequired,
    list: PropTypes.objectOf(PropTypes.string).isRequired
  })
};

export default Activity;
