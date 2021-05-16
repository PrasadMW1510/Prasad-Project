import axios from "axios";

const http = axios.create({});
http.interceptors.request.use(config => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
 // config.headers.Authorization = `Bearer ${token}`;
  return config;
}
);


http.interceptors.response.use((response) => {
  if(response.config.headers.Authorization === "Bearer null")
    return response;
  else{
  if (!response.data.status || parseInt(response.data.status) === 200)
    return response;

  }
  },
  // config => config,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      
    return Promise.reject(`Your Request Has Been Timed Out. Please Try Again.`);
    }
    else
      return Promise.reject(`Service Unavailable. Please try after sometime.`);
  }
);
   
  export default http;