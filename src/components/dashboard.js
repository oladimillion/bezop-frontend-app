import React, { Component } from 'react';
import { connect } from 'react-redux'
import { 
  AddFileRequest,
  RemoveFileRequest,
  UndoRemoveFileRequest,
  RetrieveFilesRequest,
} from "../actions/actions";
import { Logout } from "../actions/actions";
import Loading from "./loading";
import Header from "./header";
import MsgInfo from "./msg-info";

class Dashboard extends Component {

  constructor(props){

    super(props);

    this.state = { 
      isInitializing: true,
      isLoading: true,
      info: null,
      files: [],
      _showSavedFiles: true,
      _showModal: false,
      caption: "",
      file: "",
    };

    this.timerID = null;
    this.addFile = this.addFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.showSavedFiles = this.showSavedFiles.bind(this);
    this.showTrashedFiles = this.showTrashedFiles.bind(this);
    this.toggleSavedFiles = this.toggleSavedFiles.bind(this);
    this.toggleTrashedFiles = this.toggleTrashedFiles.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.logout = this.logout.bind(this);
    this.toggleModalWindow = this.toggleModalWindow.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount(){
    if(!localStorage.getItem("token")){
      this.props.history.replace("/", null);
    }
  }

  componentDidMount(){
    this.props.RetrieveFilesRequest()
      .then(data => {
        this.setState({
          isLoading: false, 
          isInitializing: false,
          files: data.data.payload,
        });
      })
      .catch(data => {
        this.setState({isLoading: false, isInitializing: false,});
      })
  }

  componentWillUnmount(){
    if(this.timerID){
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  onChange(e){
    this.setState({[e.target.name]: e.target.value});
  }

  logout(){
    this.props.Logout();
    this.props.history.replace("/", null);
  }

  onSubmit(e){
    e.preventDefault();
    let {caption, file} = this.state;

    let name = "";

    if(!caption || !file){
      const data = {
        success: false, 
        message: "All fields are required",
      };
      this.setState({info: data});
      this.setOrClearInfo();
      return;
    }

    if(file && file.name)
      name = file.name;

    if(!this.isValidFile(name.toLowerCase())){
      return;
    }

    this.setState({isLoading: true});

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("avatar", file, file.name);

    this.props.AddFileRequest(formData)
      .then(data => {
        this.setState({
          isLoading: false, 
          info: data.data,
          files: [...this.state.files, data.data.payload],
          _showModal: false,
          caption: "",
          file: "",
        });
        this.setOrClearInfo();
      })
      .catch(data => {
        this.setState({isLoading: false, info: data.response.data});
        this.setOrClearInfo();
      })

  }

  addFile(e){

    let files = e.target.files;

    if(!files.length ){
      this.setState({
        file: "",
      })
      return;
    }

    let file = files[0];
    let name = file.name.toLowerCase();

    if(!this.isValidFile(name)){
      return;
    }

    this.setState({
      file 
    })
  }

  isValidFile(name){
    if(
      !name.includes(".jpg", name.length - 4)
      && !name.includes(".png", name.length - 4)
      && !name.includes(".jpeg", name.length - 5)
      && !name.includes(".gif", name.length - 4)
    ){
      const data = {
        success: false, 
        message: "File formats supported are jpeg, jpg, png and gif",
      };
      this.setState({info: data});
      this.setOrClearInfo();
      return false;
    }

    return true;
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

  toggleFlag(_data, flag){
    return this.state.files.map(data => {
      if(data.fileid === _data.fileid){
        data.is_removed = flag;
      }
      return data;
    });
  }

  undoRemoveFile(data){
    this.setState({isLoading: true});
    this.props.UndoRemoveFileRequest({fileid: data.fileid})
      .then(data => {
        this.setState({
          isLoading: false, 
          info: data.data,
          files: this.toggleFlag(data.data.payload, false),
        });
        this.setOrClearInfo();
      })
      .catch(data => {
        this.setState({isLoading: false, info: data.response.data});
        this.setOrClearInfo();
      })
  }

  removeFile(data){
    this.setState({isLoading: true});
    this.props.RemoveFileRequest({fileid: data.fileid})
      .then(data => {
        this.setState({
          isLoading: false, 
          info: data.data,
          files: this.toggleFlag(data.data.payload, true),
        });
        this.setOrClearInfo();
      })
      .catch(data => {
        this.setState({isLoading: false, info: data.response.data});
        this.setOrClearInfo();
      })
  }

  toggleModalWindow(){
    this.setState({
      _showModal: !this.state._showModal,
      caption: "",
      file: "",
    })
  }

  showModalWindow(){
    return (
      <div className="_modal">
        <div className="modal-form">
          <header className="modal-header">
            UPLOAD A FILE
            <span 
              onClick={this.toggleModalWindow}
              className="cancel">
              <i className="fa fa-close"></i>
            </span>
          </header>
          <form className="_form" onSubmit={this.onSubmit}>
            <div className="input-wrapper">
              <input className="input" 
                onChange={this.onChange}
                name="caption"
                value={this.state.caption}
                placeholder="caption"
                type="text" />
            </div>
            <div className="input-wrapper">
              {/* <input className="input file" type="file" /> */}
              <input 
                className="input file"
                onChange={this.addFile}
                type="file" id="file" name="file"/>
            </div>
            <div className="input-wrapper">
              <button type="submit" className="button save">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  showSavedFiles(data){
    return data.filter(data => {
      if(!data.is_removed){
        return data;
      }
    })
      .map((data, index) => {
        return (
          <li className="card"
            key={data.fileid}>
            <div className="item">
              <a 
                className="item-link" 
                target="_blank"
                href={data.fileurl}>
                <img 
                  className="gallery-img"
                  src={data.fileurl} 
                  alt={data.fileid} />
              </a>
            </div>
            {/* <!-- end of item --> */}
            <div 
              className="item-title">
              {this.truncateTitle(data.caption) || 'No caption'}
            </div>
            {/* <!-- end of item title --> */}
            <div 
              onClick={()=>this.removeFile(data)}
              className="item-del delete">
              <i className="fa fa-trash"></i>
            </div>
            {/* <!-- end of item del --> */}
          </li>
        )
      })
  }

  showTrashedFiles(data){
    return data.filter(data => {
      if(data.is_removed){
        return data;
      }
    })
      .map((data, index) => {
        return (
          <li className="card"
            key={data.fileid}>
            <div className="item">
              <a 
                className="item-link" 
                target="_blank"
                href={data.fileurl}>
                <img 
                  className="gallery-img"
                  src={data.fileurl} 
                  alt={data.fileid} />
              </a>
            </div>
            {/* <!-- end of item --> */}
            <div 
              className="item-title">
              {this.truncateTitle(data.caption) || 'No caption'}
            </div>
            {/* <!-- end of item title --> */}
            <div 
              onClick={()=>this.undoRemoveFile(data)}
              className="item-del undelete">
              <i className="fa fa-heart"></i>
            </div>
            {/* <!-- end of item del --> */}
          </li>
        )
      })
  }

  truncateTitle(title){
    if(title.length > 22){
      return title.substring(0, 22) + "...";
    }
    return title;
  }

  toggleSavedFiles(){
    this.setState({_showSavedFiles: true});
  }

  toggleTrashedFiles(){
    this.setState({_showSavedFiles: false});
  }

  render() {

    const {
      isLoading,
      info,
      files,
      _showSavedFiles,
      _showModal,
      isInitializing,
    } = this.state;

    const noSavedFile = !this.showSavedFiles(files).length;
    const noTrashedFile = !this.showTrashedFiles(files).length;

    return (
      <span>
        <Header logout={this.logout} />
        {info && <MsgInfo info={info} />}
        {isLoading && <Loading />}
        {!isInitializing && <div className="dashboard">
          <div className="add-wrapper">
            <label 
              onClick={this.toggleModalWindow}
              htmlFor=""
              className="button add-file">
              <i className="fa fa-upload"></i> &nbsp; Add File
            </label>
          </div>
          {/* <!-- end of add wrapper --> */}

          <hr/>

          <div className="_flex">
            <aside className="left">
              <div className="cards-button">
                <div 
                  onClick={this.toggleSavedFiles}
                  className={_showSavedFiles ? "card-btn active" : "card-btn"}>
                  <i className="fa fa-folder-open-o"></i> &nbsp; Gallery
                </div>
                {/* <!-- end of card btn --> */}
                <div 
                  onClick={this.toggleTrashedFiles}
                  className={!_showSavedFiles ? "card-btn active" : "card-btn"}>
                  <i className="fa fa-trash-o"></i> &nbsp;  Trash
                </div>
                {/* <!-- end of card btn --> */}
              </div>
              {/* <!-- end of cards header --> */}
            </aside>
            {/* <!-- end of aside left --> */}

            <main className="main">
              <div className="cards-wrapper">
                <ul className="cards">
                  {_showSavedFiles && this.showSavedFiles(files)}
                  {!_showSavedFiles && this.showTrashedFiles(files)}
                </ul>
                {
                  noSavedFile && _showSavedFiles && 
                    <div className="_no-data">
                      NO FILE HERE
                    </div>
                }
                {
                  noTrashedFile && !_showSavedFiles && 
                    <div className="_no-data">
                      NO FILE HERE
                    </div>
                }
              </div>
              {/* <!-- end of card wrapper --> */}
            </main>
            {/* <!-- end of main --> */}
          </div>
          {/* <!-- end of flex --> */}
          {
            _showModal && this.showModalWindow()
          }
        </div>
        }
      </span>
    )
  }
}


export default connect(null, { 
  AddFileRequest,
  RemoveFileRequest,
  UndoRemoveFileRequest,
  RetrieveFilesRequest,
  Logout,
})(Dashboard);
