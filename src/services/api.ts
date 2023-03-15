import axios, { AxiosInstance, AxiosError } from "axios";
import { AppError } from "@utils/AppError";
import { storageAuthTokenGet, storageAuthTokenSave } from '@storage/storageAuthToken';

type SignOut = () => void

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void
}

const api = axios.create({
  baseURL: 'http://192.168.200.27:3333',
}) as APIInstanceProps

let failedQueue: Array<PromiseType> = []
let isRefreshing = false

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use( response => response, async (requestError) => {
    //Validate Token
    if(requestError?.response?.status == 401) {
      //Validate if Token has expired or is invalid
      if(
        requestError.response.data?.message === 'token.expired' ||
        requestError.response.data?.message === 'token.invalid'
      ){
        const { refresh_token } = await storageAuthTokenGet()

        //If the refresh_token don't exist sing out the user
        if(!refresh_token) {
          signOut()
          return Promise.reject(requestError);
        }

        const originalRequestConfig = requestError.config

        //If App is reloading add a new Bearer token or return a error
        if(isRefreshing){
          return new Promise((resolve, reject) => {
            failedQueue.push({
              onSuccess: (token: string) => {
                originalRequestConfig.headers = {'Autorization': `Bearer ${token}`}
                resolve(api(originalRequestConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              },
            })
          });
        }

        isRefreshing = true

        //Promise to try get the updated token and send the updated token
        return new Promise(async(resolve, reject) => {
          try {
            const { data } = await api.post('/sessions/refresh-token', { refresh_token })
            await storageAuthTokenSave({
              token: data.token,
              refresh_token: data.refresh_token,
            })

            //Verify if the original request was successfull and and recreate the token
            if(originalRequestConfig.data){
              originalRequestConfig.data = JSON.parse(originalRequestConfig.data);
            }

            originalRequestConfig.headers = {'Autorization': `Bearer ${data.token}`}
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            failedQueue.forEach(request => {
              request.onSuccess(data.token)
            })

            resolve(api(originalRequestConfig));
          } catch (error: any) {
            failedQueue.forEach(request => {
              request.onFailure(error)
            })
            signOut()
            reject(error);
          } finally {
            isRefreshing = false
            failedQueue = []
          }
        })
      }

      signOut();
    }

    //Erros não relacionados aos Tokens
    if(requestError.response && requestError.response.data){
      return Promise.reject(new AppError(requestError.response.data.message))
    }else{
      return Promise.reject(new AppError('Erro no servidor'))
    }
  })

  return() => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}

export { api }