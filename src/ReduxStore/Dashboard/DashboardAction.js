import{GET_DASHBOARD_RESPONSE} from './DashboardType'

export const getDashboardResponse=(response)=>{
   
    return{
        type: GET_DASHBOARD_RESPONSE,
        payload: response
    }
}

