import{GET_DASHBOARD_RESPONSE} from './DashboardType'
import axios from 'axios';

const initialResponseState={
    dashboardResponse:[]
}
export const dashboardReducer=(state=initialResponseState,action)=>{
switch(action.type){
    case GET_DASHBOARD_RESPONSE:
        const dashboardResponse = action.payload;
        return{            
            ...state,
            dashboardResponse 
            
        }
        default:return state
}
}