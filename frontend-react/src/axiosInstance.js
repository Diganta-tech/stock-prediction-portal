import axios from "axios";

const baseURL=import.meta.env.VITE_BACKEND_BASE_API
const axiosInstance=axios.create({
    baseURL:baseURL,
    headers:{
        'Content-Type':'application/json',
    }
})

// Request Interceptor
axiosInstance.interceptors.request.use(
    function(config){
        const accessToken=localStorage.getItem('accessToken')
        if(accessToken){
            config.headers['Authorization']=`Bearer ${accessToken}`
        }      
        return config;
    },
    function(error){
        return Promise.reject(error);
    }
)

//Response Interceptor
axiosInstance.interceptors.response.use(
    function(response){
        return response;
    },
    // Handle failed responses
    async function(error){
        const oriiginalRequest=error.config;
        if(error.response.status===401 && !oriiginalRequest.retry){
            oriiginalRequest.retry=true;
            const refreshToken=localStorage.getItem('refreshToken')
            try{
                const response=await axiosInstance.post('/token/refresh/',{refresh: refreshToken})
                localStorage.setItem('accessToken',response.data.access)
                oriiginalRequest.headers['Authorization']=`Bearer ${response.data.access}`
                return axiosInstance(oriiginalRequest)
            }catch(error){
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refershToken')
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;