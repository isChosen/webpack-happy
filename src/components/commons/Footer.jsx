import React, { Component, Fragment } from 'react';
import NavLink from './NavLink';
import footerLess from '../../less/footer.less';

export default class Footer extends Component {
  render() {
    return (
      <Fragment>
        <NavLink to="/home" className={footerLess['tab']} activeClassName={footerLess['active']} >
          <i className="icon iconfont">&#xe6b8;</i>
          <span>Home</span>
        </NavLink>
        <NavLink to="/product" className={footerLess['tab']} activeClassName={footerLess['active']} >
          <i className="icon iconfont">&#xe6af;</i>
          <span>Product</span>
        </NavLink>
        <NavLink to="/profile" className={footerLess['tab']} activeClassName={footerLess['active']} >
          <i className="icon iconfont">&#xe7dd;</i>
          <span>Profile</span>
        </NavLink>
      </Fragment>
    )
  }
}
