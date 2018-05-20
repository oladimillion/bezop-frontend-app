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
      isLoading: true,
      info: null,
      files: [],
      _showSavedFiles: true,
    };

    this.timerID = null;
    this.addFile = this.addFile.bind(this);
    this.showSavedFiles = this.showSavedFiles.bind(this);
    this.showTrashedFiles = this.showTrashedFiles.bind(this);
    this.toggleSavedFiles = this.toggleSavedFiles.bind(this);
    this.toggleTrashedFiles = this.toggleTrashedFiles.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.logout = this.logout.bind(this);
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
          files: data.data.payload,
        });
      })
      .catch(data => {
        this.setState({isLoading: false});
      })
  }

  componentWillUnmount(){
    if(this.timerID){
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  logout(){
    this.props.Logout();
    this.props.history.replace("/", null);
  }

  addFile(e){

    let files = e.target.files;

    if(!files && !files.length)
      return;

    let file = files[0];
    let name = file.name;

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
      return;
    }

    this.setState({isLoading: true});

    const formData = new FormData();
    formData.append("avatar", file, name);

    this.props.AddFileRequest(formData)
      .then(data => {
        this.setState({
          isLoading: false, 
          info: data.data,
          files: [...this.state.files, data.data.payload],
        });
        this.setOrClearInfo();
      })
      .catch(data => {
        this.setState({isLoading: false, info: data.response.data});
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
                  width="100%"
                  height="100%"
                  src={data.fileurl} 
                  alt={data.fileid} />
              </a>
            </div>
            {/* <!-- end of item --> */}
            <div 
              onClick={()=>this.removeFile(data)}
              className="item-title">
              remove
            </div>
            {/* <!-- end of item title --> */}
            <div 
              style={{"display": "none"}}
              className="item-del">
              delete
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
                  width="100%"
                  height="100%"
                  src={data.fileurl} 
                  alt={data.fileid} />
              </a>
            </div>
            {/* <!-- end of item --> */}
            <div 
              onClick={()=>this.undoRemoveFile(data)}
              className="item-title">
              undo removal
            </div>
            {/* <!-- end of item title --> */}
            <div 
              style={{"display": "none"}}
              className="item-del">
              delete
            </div>
            {/* <!-- end of item del --> */}
          </li>
        )
      })
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
    } = this.state;

    const noSavedFile = !this.showSavedFiles(files).length;
    const noTrashedFile = !this.showTrashedFiles(files).length;

    return (
      <span>
        <Header logout={this.logout} />
        {info && <MsgInfo info={info} />}
        {isLoading && <Loading />}
        {!isLoading && <div className="dashboard">
          <div className="add-wrapper">
            <label 
              htmlFor="file"
              className="button add-file">
              Add File
            </label>
            <input 
              onChange={this.addFile}
              style={{"display": "none"}}
              type="file" id="file" name="file"/>
          </div>
          {/* <!-- end of add wrapper --> */}


          <div className="cards-button">
            <div 
              onClick={this.toggleSavedFiles}
              className={_showSavedFiles ? "card-btn active" : "card-btn"}>
              SAVED FILES
            </div>
            {/* <!-- end of card btn --> */}
            <div 
              onClick={this.toggleTrashedFiles}
              className={!_showSavedFiles ? "card-btn active" : "card-btn"}>
              TRASHED FILES
            </div>
            {/* <!-- end of card btn --> */}
          </div>
          {/* <!-- end of cards header --> */}

          <div className="cards-wrapper">
            <ul className="cards">
              {_showSavedFiles && this.showSavedFiles(files)}
              {!_showSavedFiles && this.showTrashedFiles(files)}
            </ul>
            {
              noSavedFile && _showSavedFiles && 
                <div className="_no-data">
                  NO SAVED FILE YET
                </div>
            }
            {
              noTrashedFile && !_showSavedFiles && 
                <div className="_no-data">
                  NO TRASHED FILE YET
                </div>
            }
          </div>
          {/* <!-- end of card wrapper --> */}
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
