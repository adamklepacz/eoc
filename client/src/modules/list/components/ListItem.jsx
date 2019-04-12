import React, { Fragment, PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import VotingBox from 'modules/list/components/VotingBox';
import Textarea from 'common/components/Forms/Textarea';
import TextInput from 'common/components/Forms/TextInput';
import NewComment from '../../../common/components/Comments/NewComment';
import Comment from '../../../common/components/Comments/Comment';
import { ChevronDown, ChevronUp } from 'assets/images/icons';
import { RouterMatchPropType } from 'common/constants/propTypes';
import { addItemDescription } from '../model/actions';
import SaveButton from 'common/components/SaveButton';

class ListItem extends PureComponent {
  constructor(props) {
    super(props);

    const {
      data: { archived, description }
    } = this.props;
    this.state = {
      areDetailsVisible: false,
      done: archived,
      isHovered: false,
      isNewCommentVisible: false,
      itemDescription: description ? description.trim() : ''
    };
  }

  handleItemToggling = (authorName, id, archived) => () => {
    const { done } = this.state;
    const { toggleItem } = this.props;

    this.setState({ done: !done });
    toggleItem(authorName, id, archived);
  };

  toggleDetails = () =>
    this.setState(({ areDetailsVisible }) => ({
      areDetailsVisible: !areDetailsVisible
    }));

  showAddNewComment = () => this.setState({ isNewCommentVisible: true });

  hideAddNewComment = () => this.setState({ isNewCommentVisible: false });

  handleAddNewComment = comment => {
    // Adding new comment will be handled in next tasks
  };

  handleMouseEnter = () => this.setState({ isHovered: true });

  handleMouseLeave = () => this.setState({ isHovered: false });

  handleAddDescription = () => {
    const { itemDescription } = this.state;
    const {
      addItemDescription,
      data: { _id: itemId, description: previousDescription },
      match: {
        params: { id: listId }
      }
    } = this.props;

    if (previousDescription.trim() !== itemDescription.trim()) {
      addItemDescription(listId, itemId, itemDescription);
    }
  };

  handleItemDescription = value => this.setState({ itemDescription: value });

  renderDetails = () => {
    const { isNewCommentVisible, itemDescription } = this.state;
    const {
      data: { description }
    } = this.props;

    return (
      <Fragment>
        <div className="list-item__info">
          <div className="list-item__info-textarea">
            <Textarea
              placeholder="Description"
              initialValue={description}
              onChange={this.handleItemDescription}
            />
          </div>
          <div className="list-item__info-details">
            <TextInput placeholder="Link" />
            <SaveButton
              value="Save data"
              onClick={this.handleAddDescription}
              disabled={
                itemDescription.trim() === (description && description.trim())
              }
            />
          </div>
        </div>
        <div className="list-item__new-comment">
          {isNewCommentVisible ? (
            <NewComment
              onAddNewComment={this.handleAddNewComment}
              onEscapePress={this.hideAddNewComment}
            />
          ) : (
            <button
              className="list-item__add-new-button link-button"
              onClick={this.showAddNewComment}
              type="button"
            >
              Add comment
            </button>
          )}
        </div>
        <div className="list-item__comments">{this.renderComments()}</div>
      </Fragment>
    );
  };

  renderComments = () => (
    <Fragment>
      <h2 className="list-item__heading">Comments</h2>
      <Comment
        author="Adam Klepacz"
        comment="  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Excepturi voluptatem vitae qui nihil reprehenderit quia nam
                accusantium nobis. Culpa ducimus aspernatur ea libero! Nobis
                ipsam, molestiae similique optio sint hic!"
      />
      <Comment
        author="Adam Klepacz"
        comment="  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Excepturi voluptatem vitae qui nihil reprehenderit quia nam
                accusantium nobis. Culpa ducimus aspernatur ea libero! Nobis
                ipsam, molestiae similique optio sint hic!"
      />
    </Fragment>
  );

  renderChevron = () => {
    const { areDetailsVisible, isHovered } = this.state;

    return (
      <button
        className={classNames('list-item__chevron', {
          'list-item__chevron--details-visible': areDetailsVisible
        })}
        onClick={this.toggleDetails}
        type="button"
      >
        {isHovered && (areDetailsVisible ? <ChevronUp /> : <ChevronDown />)}
      </button>
    );
  };

  render() {
    const {
      data: { archived, authorName, _id, isVoted, name, votesCount },
      voteForItem
    } = this.props;

    const { done, areDetailsVisible } = this.state;
    return (
      <li
        className={classNames('list-item', {
          'list-item--restore': !done && archived,
          'list-item--done': done || archived,
          'list-item--details-visible': areDetailsVisible
        })}
      >
        <div
          className="list-item__top"
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.renderChevron()}
          <input
            className="list-item__input"
            id={`option${_id}`}
            name={`option${_id}`}
            type="checkbox"
          />
          <label
            className="list-item__label"
            htmlFor={`option${_id}`}
            id={`option${_id}`}
            onClick={this.toggleDetails}
          >
            <span className="list-item__data">
              <span>{name}</span>
              <span className="list-item__author">{`Added by: ${authorName}`}</span>
            </span>
            {!archived && (
              <VotingBox
                isVoted={isVoted}
                voteForItem={voteForItem}
                votesCount={votesCount}
              />
            )}
          </label>
          <button
            className="list-item__icon z-index-high"
            onClick={this.handleItemToggling(authorName, _id, archived)}
            type="button"
          />
        </div>
        {areDetailsVisible && (
          <div className="list-item__details">{this.renderDetails()}</div>
        )}
      </li>
    );
  }
}

ListItem.propTypes = {
  data: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
  ),
  match: RouterMatchPropType.isRequired,

  addItemDescription: PropTypes.func.isRequired,
  toggleItem: PropTypes.func,
  voteForItem: PropTypes.func
};

export default withRouter(
  connect(
    null,
    { addItemDescription }
  )(ListItem)
);
