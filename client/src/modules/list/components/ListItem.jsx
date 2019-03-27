import React, { PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import VotingBox from 'modules/list/components/VotingBox';

class ListItem extends PureComponent {
  constructor(props) {
    super(props);
    const { archived } = this.props;
    this.state = { done: archived };
  }

  handleItemToggling = (authorName, id, archived) => () => {
    const { done } = this.state;
    this.setState({ done: !done });
    const { toggleItem } = this.props;
    toggleItem(authorName, id, archived);
  };

  render() {
    const {
      archived,
      authorName,
      id,
      isVoted,
      name,
      voteForItem,
      votesCount
    } = this.props;
    const { done } = this.state;
    return (
      <li
        className={classNames('items-list__item', {
          'items-list__item--restore': !done && archived,
          'items-list__item--done': done || archived
        })}
      >
        <input
          className="item-list__input"
          id={`option${id}`}
          name={`option${id}`}
          type="checkbox"
        />
        <label
          className="items-list__label"
          htmlFor={`option${id}`}
          id={`option${id}`}
          onClick={this.handleItemToggling(authorName, id, archived)}
        >
          <span className="items-list__data">
            <span>{name}</span>
            <span className="items-list__author">{`Added by: ${authorName}`}</span>
          </span>
          {!archived && (
            <VotingBox
              voteForItem={voteForItem}
              votesCount={votesCount}
              isVoted={isVoted}
            />
          )}
        </label>
      </li>
    );
  }
}

ListItem.propTypes = {
  archived: PropTypes.bool,
  authorName: PropTypes.string,
  id: PropTypes.string.isRequired,
  isVoted: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  votesCount: PropTypes.number.isRequired,

  toggleItem: PropTypes.func,
  voteForItem: PropTypes.func
};

export default ListItem;