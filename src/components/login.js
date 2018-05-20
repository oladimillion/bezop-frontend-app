import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { LoginRequest } from "../actions/actions";
import {  connect } from 'react-redux'
import Loading from "./loading";
import MsgInfo from "./msg-info";
import Header from "./header";

class Login extends Component {

  constructor(props){

    super(props);

    this.state = { 
      username: "",
      password: "",
      username_error: false,
      password_error: false,
      isLoading: false,
      info: null,
    }

    this.timerID = null;
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount(){
    if(localStorage.getItem("token")){
      this.props.history.replace("/dashboard", null);
    }
  }

  componentWillUnmount(){
    if(this.timerID){
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  validateInput(data){
    let username_error = false;
    let password_error = false;

    if(!data.username){
      username_error = true;
    }
    if(!data.password){
      password_error = true;
    }


    this.setState({
      username_error,
      password_error,
    });

    return !username_error && !password_error;
  }

  onSubmit(e){
    e.preventDefault();
    const {username, password} = this.state;
    const data = { username, password };

    if(!this.validateInput(data)){
      return;
    }

    this.setState({isLoading: true});
    this.props.LoginRequest(data)
      .then(data => {
        this.setState({
          username: "",
          password: "",
        });
        this.setOrClearInfo();
        this.setState({isLoading: false});
        this.props.history.replace("/dashboard", null);
      })
      .catch(data => {
        this.setState({
          isLoading: false, 
          info: data.response.data
        });
        this.setOrClearInfo();
      })
  }

  setOrClearInfo(){
    if(this.timerID){
      clearTimeout(this.timerID);
      this.timerID = null;
    }

    this.timerID = setTimeout(()=> {
      this.setState({info: null});
      clearTimeout(this.timerID);
    }, 7000);
  }

  onChange(e){
    this.setState({[e.target.name]: e.target.value});
  }

  render() {

    const {
      username, 
      password, 
      username_error, 
      password_error,
      isLoading,
      info,
    } = this.state;

    return (
      <span>
        <Header />
        <div 
          className="form login-form">
          {info && <MsgInfo info={info} />}
          {isLoading && <Loading />}
          <form onSubmit={this.onSubmit}>
            <div className="form-heading">
              LOGIN
            </div>
            {/* <!-- end of form heading --> */}
            <div className="input-wrapper">
              <input 
                onChange={ this.onChange }
                value={username}
                name="username"
                className="input" type="text"
                placeholder="username" />
            </div>
            {/* <!-- end of input wrapper --> */}
            {
              username_error && 
                <div className="helper-info">
                  This field is required
                </div>
            }
            {/* <!-- end of helper info --> */}
            <div className="input-wrapper">
              <input
                onChange={ this.onChange }
                value={password}
                name="password"
                className="input" type="password"
                placeholder="password" />
            </div>
            {/* <!-- end of input wrapper --> */}
            {
              password_error && 
                <div className="helper-info">
                  This field is required
                </div>
            }
            {/* <!-- end of helper info --> */}
            <div className="input-wrapper _flex">
              <div className="_left">
                <button type="submit" 
                  className="button login-btn">
                  Login
                </button>
              </div>
              {/* <!-- end of _left --> */}
              <div className="_right">
                or
                <Link className="_link" to="/register">
                  &nbsp; register
                </Link>
              </div>
              {/* <!-- end of _right --> */}
            </div>
            {/* <!-- end of input wrapper --> */}
          </form>
        </div>
      </span>
    )
  }
}

export default connect(null, { 
  LoginRequest
})(Login);
