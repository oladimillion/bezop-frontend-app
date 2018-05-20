import axios from "axios";
import jwtDecode from "jwt-decode";
import SetAuthToken from "../auth-token";
import  { USER } from "./types";

const API = "";

export function SetCurrentUser(data){ 
  // saving user's data in the store
  return { 
    type: USER,
    payload: data
  }
}

export function Logout(){
  return dispatch => {
    // removing token to request headers
    SetAuthToken();
    dispatch(SetCurrentUser({}));
  }
}

export function LoginRequest(data){ 
  return dispatch => { 
    return axios.post(API + "/api/v1/signin", data)
      .then(data => {
        // console.log(data);
        SetAuthToken(data.data.payload);
        dispatch(
          SetCurrentUser(jwtDecode(localStorage.getItem("token")))
        );
        return data;
      })
  }
}

export function RegRequest(data){ 
  return dispatch => { 
    return axios.post(API + "/api/v1/signup", data)
  }
}

export function AddFileRequest(data){ 
  return dispatch => { 
    return axios.post(API + "/api/v1/add-file", data)
  }
}

export function RemoveFileRequest(data){ 
  return dispatch => { 
    return axios.put(API + "/api/v1/remove-file", data)
  }
}

export function UndoRemoveFileRequest(data){ 
  return dispatch => { 
    return axios.put(API + "/api/v1/undo-remove-file", data)
  }
}

export function RetrieveFilesRequest(){ 
  return dispatch => { 
    return axios.get(API + "/api/v1/retrieve-files")
  }
}
