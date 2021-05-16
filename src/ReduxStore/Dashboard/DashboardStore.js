import {createStore,applyMiddleware} from 'redux';
import {dashboardReducer} from './DashboardReducer';
import {getDashboardResponse} from './DashboardAction';

const store = createStore(dashboardReducer);

store.subscribe(()=>console.log("resposereduxstore",store.getState()));
store.dispatch(getDashboardResponse());

export default store;