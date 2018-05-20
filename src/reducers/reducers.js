import { USER } from "../actions/types";

export function User (state = {}, actions = {}){ 

  switch(actions.type){ 

    case USER:
      return actions.payload

    default:
      return state
  }
}
