import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _flowRight from 'lodash/flowRight';

import { updateListItem } from '../model/actions';
import { RouterMatchPropType } from 'common/constants/propTypes';
import { KeyCodes } from 'common/constants/enums';
import Preloader from 'common/components/Preloader';
import withSocket from 'common/hoc/withSocket';

class ListItemName extends PureComponent {
  constructor(props) {
    super(props);

    const { name } = this.props;

    this.state = {
      isNameInputFocused: false,
      isTipVisible: false,
      name,
      pending: false
    };

    this.nameInput = React.createRef();
    this.listItemName = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { name: prevName } = prevProps;
    const { name } = this.props;

    if (name.length === 0) {
      this.nameInput.current.focus();
    }

    if (prevName !== name) {
      this.updateNameWS(name);
    }
  }

  updateNameWS = updatedName => this.setState({ name: updatedName });

  handleKeyPress = event => {
    const { code } = event;

    if (code === KeyCodes.ENTER || code === KeyCodes.ESCAPE) {
      this.handleNameUpdate();
    }
  };

  handleNameUpdate = () => {
    const { name: updatedName } = this.state;
    const {
      itemId,
      match: {
        params: { id: listId }
      },
      name,
      updateListItem,
      socket,
      onBusy,
      onFree
    } = this.props;
    const isNameUpdated = updatedName !== name;
    const canBeUpdated = updatedName.trim().length > 1;

    if (canBeUpdated && isNameUpdated) {
      this.setState({ pending: true });
      onBusy();

      updateListItem(
        name,
        listId,
        itemId,
        { name: updatedName },
        socket
      ).finally(() => {
        this.setState({
          pending: false,
          isTipVisible: false
        });

        this.handleNameInputBlur();
        onFree();
      });
    }

    if (!canBeUpdated) {
      this.setState({ isTipVisible: true });
    }
  };

  handleNameChange = event => {
    const {
      target: { value }
    } = event;

    this.setState({ name: value });
  };

  renderTip = () => (
    <span className="error-message">Name can not be empty.</span>
  );

  handleNameInputFocus = () => {
    const { onFocus } = this.props;

    onFocus();
    this.setState({ isNameInputFocused: true });
    document.addEventListener('keydown', this.handleKeyPress);
    document.addEventListener('mousedown', this.handleClickOutside);
  };

  handleNameInputBlur = () => {
    const { onBlur } = this.props;
    const { name } = this.state;

    if (name) {
      onBlur();
      this.nameInput.current.blur();
      this.setState({ isNameInputFocused: false });
      document.removeEventListener('keydown', this.handleKeyPress);
      document.removeEventListener('mousedown', this.handleClickOutside);

      return;
    }

    this.nameInput.current.focus();
  };

  handleOnClick = event => {
    event.stopPropagation();
    event.preventDefault();
    this.nameInput.current.focus();
  };

  handleClickOutside = event => {
    const { target } = event;

    if (this.listItemName && !this.listItemName.current.contains(target)) {
      this.handleNameUpdate();
    }
  };

  render() {
    const { isNameInputFocused, isTipVisible, name, pending } = this.state;
    const { isMember } = this.props;

    return (
      <div ref={this.listItemName}>
        <div className="list-item-name">
          <input
            className={classNames('list-item-name__input', {
              'primary-input': isNameInputFocused,
              'list-item-name__input--disabled': pending
            })}
            disabled={!isMember || pending}
            onBlur={this.handleNameInputBlur}
            onChange={this.handleNameChange}
            onClick={this.handleOnClick}
            onTouchEnd={this.handleOnClick}
            onFocus={this.handleNameInputFocus}
            ref={this.nameInput}
            type="text"
            value={name}
          />
          {pending && <Preloader />}
        </div>
        {isTipVisible && this.renderTip()}
      </div>
    );
  }
}

ListItemName.propTypes = {
  isMember: PropTypes.bool.isRequired,
  itemId: PropTypes.string.isRequired,
  match: RouterMatchPropType.isRequired,
  name: PropTypes.string.isRequired,
  socket: PropTypes.objectOf(PropTypes.any),

  onBlur: PropTypes.func.isRequired,
  onBusy: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onFree: PropTypes.func.isRequired,
  updateListItem: PropTypes.func.isRequired
};

export default _flowRight(
  withSocket,
  withRouter,
  connect(
    null,
    { updateListItem }
  )
)(ListItemName);
