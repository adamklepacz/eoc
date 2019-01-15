import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import VotingBox from './VotingBox';
import { PLACEHOLDER_URL } from '../common/variables';

const ProductListItem = ({
  archived,
  author,
  id,
  image = PLACEHOLDER_URL,
  name,
  toggleItem,
  voteForItem,
  votesCount,
  whetherUserVoted
}) => (
  <li
    className={classNames('products-list__item', {
      'products-list__item--blue': archived,
      'products-list__item--green': !archived
    })}
  >
    <input
      className="product-list__input"
      id={`option${id}`}
      name={`option${id}`}
      type="checkbox"
    />
    <label
      className="products-list__label"
      htmlFor={`option${id}`}
      id={`option${id}`}
      onClick={() => toggleItem(author, id, archived)}
    >
      <img alt="Product icon" className="products-list__icon" src={image} />
      <span className="products-list__data">
        <span>{name}</span>
        <span className="products-list__author">{`Ordered by: ${author}`}</span>
      </span>
      {!archived && (
        <VotingBox
          voteForItem={voteForItem}
          votesCount={votesCount}
          whetherUserVoted={whetherUserVoted}
        />
      )}
    </label>
  </li>
);

ProductListItem.propTypes = {
  archived: PropTypes.bool,
  author: PropTypes.string,
  id: PropTypes.string.isRequired,
  image: PropTypes.string,
  name: PropTypes.string.isRequired,
  votesCount: PropTypes.number.isRequired,
  whetherUserVoted: PropTypes.bool.isRequired,

  toggleItem: PropTypes.func,
  voteForItem: PropTypes.func
};

export default ProductListItem;
