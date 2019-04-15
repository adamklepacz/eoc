import React, { Fragment, PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _isEmpty from 'lodash/isEmpty';
import _trim from 'lodash/trim';

import VotingBox from 'modules/list/components/VotingBox';
import Textarea from 'common/components/Forms/Textarea';
import TextInput from 'common/components/Forms/TextInput';
import NewComment from '../../../common/components/Comments/NewComment';
import Comment from '../../../common/components/Comments/Comment';
import { RouterMatchPropType } from 'common/constants/propTypes';
import { addItemDescription, addItemLink } from '../model/actions';
import SaveButton from 'common/components/SaveButton';
import { areStringsEqual, isUrlValid } from 'common/utils/helpers';
import ErrorMessage from 'common/components/Forms/ErrorMessage';

class ListItem extends PureComponent {
  constructor(props) {
    super(props);

    const {
      data: { isOrdered, description, link }
    } = this.props;

    this.state = {
      areDetailsVisible: false,
      areFieldsUpdated: false,
      done: isOrdered,
      isNewCommentVisible: false,
      isValidationErrorVisible: false,
      itemDescription: description,
      link
    };
  }

  componentDidUpdate() {
    this.checkIfFieldsUpdated();
  }

  handleItemToggling = (authorName, id, isOrdered) => () => {
    const { toggleItem } = this.props;

    this.setState(({ done }) => ({ done: !done }));
    toggleItem(authorName, id, isOrdered);
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

  handleDataUpdate = () => {
    const { itemDescription, link } = this.state;
    const {
      data: { description: previousDescription, link: previousLink }
    } = this.props;
    const isLinkUpdated = !areStringsEqual(previousLink, link);
    const isDescriptionUpdated = !areStringsEqual(
      previousDescription,
      itemDescription
    );

    if (isLinkUpdated) {
      this.handleLinkUpdate();
    }

    if (isDescriptionUpdated) {
      this.handleDescriptionUpdate();
    }
  };

  handleLinkUpdate = () => {
    const { link } = this.state;
    const {
      addItemLink,
      data: { _id: itemId },
      match: {
        params: { id: listId }
      }
    } = this.props;
    const canBeUpdated = isUrlValid(link) || _isEmpty(_trim(link));

    if (canBeUpdated) {
      addItemLink(listId, itemId, link);
    } else if (!isUrlValid(link)) {
      this.setState({ isValidationErrorVisible: true });
    }
  };

  handleDescriptionUpdate = () => {
    const { itemDescription } = this.state;
    const {
      addItemDescription,
      data: { _id: itemId },
      match: {
        params: { id: listId }
      }
    } = this.props;

    addItemDescription(listId, itemId, itemDescription);
  };

  checkIfFieldsUpdated = () => {
    const {
      data: { description: previousDescription, link: previousLink }
    } = this.props;
    const { itemDescription, link } = this.state;

    const isLinkUpdated = !areStringsEqual(previousLink, link);
    const isDescriptionUpdated = !areStringsEqual(
      previousDescription,
      itemDescription
    );

    if (isLinkUpdated || isDescriptionUpdated) {
      this.setState({ areFieldsUpdated: true });
      return;
    }

    this.setState({ areFieldsUpdated: false });
  };

  handleItemDescription = value => this.setState({ itemDescription: value });

  handleLinkValue = value =>
    this.setState({ link: value, isValidationErrorVisible: false });

  renderDetails = () => {
    const {
      areFieldsUpdated,
      isNewCommentVisible,
      isValidationErrorVisible
    } = this.state;
    const {
      data: { description, link }
    } = this.props;

    return (
      <Fragment>
        <div className="list-item__info">
          <div className="list-item__info-textarea">
            <Textarea
              initialValue={description}
              onChange={this.handleItemDescription}
              placeholder="Description"
            />
          </div>
          <div className="list-item__info-details">
            <TextInput
              initialValue={link}
              onChange={this.handleLinkValue}
              placeholder="Link"
            />
            {isValidationErrorVisible && (
              <div className="list-item__validation-error">
                <ErrorMessage message="Incorrect url." />
              </div>
            )}
            <SaveButton
              disabled={!areFieldsUpdated}
              onClick={this.handleDataUpdate}
              value="Save data"
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

  render() {
    const {
      data: { isOrdered, authorName, _id, isVoted, name, votesCount },
      voteForItem
    } = this.props;
    const { done, areDetailsVisible } = this.state;

    return (
      <li
        className={classNames('list-item', {
          'list-item--restore': !done && isOrdered,
          'list-item--done': done || isOrdered,
          'list-item--details-visible': areDetailsVisible
        })}
      >
        <div
          className={classNames('list-item__top', {
            'list-item__top--details-visible': areDetailsVisible,
            'list-item__top--details-not-visible': !areDetailsVisible
          })}
          onClick={this.toggleDetails}
          role="listitem"
        >
          <input
            className="list-item__input"
            id={`option${_id}`}
            name={`option${_id}`}
            type="checkbox"
          />
          <label className="list-item__label" id={`option${_id}`}>
            <span className="list-item__data">
              <span>{name}</span>
              <span className="list-item__author">{`Added by: ${authorName}`}</span>
            </span>
          </label>
          {!isOrdered && (
            <VotingBox
              isVoted={isVoted}
              voteForItem={voteForItem}
              votesCount={votesCount}
            />
          )}
          <button
            className="list-item__icon z-index-high"
            onClick={this.handleItemToggling(authorName, _id, isOrdered)}
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
  addItemLink: PropTypes.func.isRequired,
  toggleItem: PropTypes.func,
  voteForItem: PropTypes.func
};

export default withRouter(
  connect(
    null,
    { addItemDescription, addItemLink }
  )(ListItem)
);
