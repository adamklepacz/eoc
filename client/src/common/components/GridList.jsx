import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';

import CardItem from 'common/components/CardItem';
import MessageBox from 'common/components/MessageBox';
import { MessageType } from 'common/constants/enums';

const GridList = ({ icon, items, placeholder, name }) => (
  <div className="grid-list">
    <h2 className="grid-list__heading">
      {icon}
      {name}
    </h2>
    {_isEmpty(items) ? (
      <MessageBox message={placeholder} type={MessageType.INFO} />
    ) : (
      <ul className="grid-list__list">
        {_map(items, item => (
          <li className="grid-list__item" key={item._id}>
            <Link to={`list/${item._id}`}>
              <CardItem name={item.name} />
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
);

GridList.propTypes = {
  icon: PropTypes.node.isRequired,
  items: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired
};

export default GridList;
