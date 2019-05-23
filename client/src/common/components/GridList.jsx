import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';

import CardItem from 'common/components/CardItem';
import MessageBox from 'common/components/MessageBox';
import { MessageType, Routes } from 'common/constants/enums';
import CardPlus from 'common/components/CardPlus';
import {
  addListToFavourites,
  removeListFromFavourites
} from 'modules/list/model/actions';
import {
  addCohortToFavourites,
  removeCohortFromFavourites
} from 'modules/cohort/model/actions';
import Preloader from 'common/components/Preloader';
import ListModeItem from 'common/components/ListModeItem';

class GridList extends PureComponent {
  handleFavClick = (itemId, isFavourite) => event => {
    event.stopPropagation();
    const {
      addCohortToFavourites,
      addListToFavourites,
      removeCohortFromFavourites,
      removeListFromFavourites,
      route
    } = this.props;

    let action;
    switch (route) {
      case Routes.LIST:
        action = isFavourite ? removeListFromFavourites : addListToFavourites;
        break;
      case Routes.COHORT:
        action = isFavourite
          ? removeCohortFromFavourites
          : addCohortToFavourites;
        break;
      default:
        break;
    }
    return action(itemId);
  };

  handleCardClick = (route, itemId) => () => {
    const { history } = this.props;
    history.push(`/${route}/${itemId}`);
  };

  renderAddNew = () => {
    const { onAddNew } = this.props;

    return (
      <li className="elements__element">
        <button className="elements__button" onClick={onAddNew} type="button">
          <CardPlus />
        </button>
      </li>
    );
  };

  renderListMode = () => {
    const { color, items, route } = this.props;

    return _map(items, item => (
      <li className="elements__element" key={item._id}>
        <ListModeItem
          color={color}
          item={item}
          onCardClick={this.handleCardClick(route, item._id)}
          onFavClick={this.handleFavClick(item._id, item.isFavourite)}
          route={route}
        />
      </li>
    ));
  };

  renderTilesMode = () => {
    const { color, items, route } = this.props;

    return _map(items, item => (
      <li className="elements__element" key={item._id}>
        <CardItem
          color={color}
          item={item}
          onCardClick={this.handleCardClick(route, item._id)}
          onFavClick={this.handleFavClick(item._id, item.isFavourite)}
          route={route}
        />
      </li>
    ));
  };

  render() {
    const {
      icon,
      items,
      listMode,
      name,
      onAddNew,
      pending,
      placeholder
    } = this.props;

    return (
      <div className="elements">
        <h2 className="elements__heading">
          {icon}
          {name}
        </h2>
        <div className="elements__body">
          <ul className={listMode ? 'elements__list' : 'elements__tiles'}>
            {onAddNew && this.renderAddNew()}
            {listMode ? this.renderListMode() : this.renderTilesMode()}
          </ul>
          {pending && <Preloader />}
          {_isEmpty(items) && !pending && (
            <MessageBox message={placeholder} type={MessageType.INFO} />
          )}
        </div>
      </div>
    );
  }
}

GridList.propTypes = {
  color: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func
  }),
  icon: PropTypes.node.isRequired,
  items: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  listMode: PropTypes.bool,
  name: PropTypes.string.isRequired,
  pending: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,

  addCohortToFavourites: PropTypes.func,
  addListToFavourites: PropTypes.func,
  onAddNew: PropTypes.func,
  removeCohortFromFavourites: PropTypes.func,
  removeListFromFavourites: PropTypes.func
};

export default withRouter(
  connect(
    null,
    {
      addCohortToFavourites,
      addListToFavourites,
      removeCohortFromFavourites,
      removeListFromFavourites
    }
  )(GridList)
);
