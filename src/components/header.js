import React, { Component } from 'react';
import { connect } from 'react-redux'

class Header extends Component {

  constructor(props){
    super(props);

    this.logout = this.logout.bind(this);
  }

  logout(){
    this.props.logout();
  }

  render() {

    const {username} = this.props.user;

    return (
        <header className="_header">
          <div className="w-header">
            <div className="lp-header">
              SIMPLY-UPLOAD
            </div>
            {/* <!-- end of lp header --> */}
            {
              username && <div className="rp-header">
                Welcome {username} / &nbsp;
                <a 
                  onClick={this.logout}
                  href="javascript:void">
                  Logout
                </a>
              </div>
            }
            {/* <!-- end of rp header --> */}
          </div>
          {/* <!-- end of w header --> */}
        </header>
    )
  }
}

function mapStateToProps(state){
  return { 
    user: state.User,
  }
}

export default connect(mapStateToProps, {})(Header);

