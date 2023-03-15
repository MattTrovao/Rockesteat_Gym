import React, { createContext, ReactNode, useEffect, useState } from "react";

import { api } from "@services/api";

import { UserDTO } from "@dtos/UserDTO";

import { storageUserGet, storageUserSave, storageUserRemove } from "@storage/storageUser";
import { storageAuthTokenSave, storageAuthTokenGet, storageAuthTokenRemove } from "@storage/storageAuthToken";

export type AuthContextProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (setUpdated: UserDTO) => Promise<void>;
  loadingUser: boolean;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);

  const [loadingUser, setLoadingUser] = useState(true)

  //Update and set token of loged user in the device storage data
  async function userAndTokenUpdate(userData: UserDTO, token: string ){
    try {

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // await storageUserSave(userData)
      // await storageAuthTokenSave(token)
      setUser(userData);

    } catch (error) {
      throw error
    }
  }

  //Save logged User and Token in the device storage data
  async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string ){
    try {
      setLoadingUser(true)

      await storageUserSave(userData)
      await storageAuthTokenSave({token, refresh_token})
    } catch (error) {
      throw error
    }finally{
      setLoadingUser(false)
    }
  }

  //User try to sign in
  async function signIn(email: string, password: string) {
    try {
      setLoadingUser(true)

      const { data } = await api.post('/sessions', { email, password })    

      if (data.user && data.token && data.refresh_token) {
        await storageUserAndTokenSave(data.user, data.token, data.refresh_token)
        userAndTokenUpdate(data.user, data.token)
      }
    } catch (error) {
      throw error;
    } finally{
      setLoadingUser(false)
    }
  }

  //User try to sing out
  async function signOut(){
    try {
      setLoadingUser(true)

      setUser({} as UserDTO)

      await storageUserRemove()
      await storageAuthTokenRemove()

    } catch (error) {
      throw error;
    }finally{
      setLoadingUser(false)

    }
  }

  //Try update user data when the profile is updated
  async function updateUserProfile(userUpdated:UserDTO) {
    try {
      setUser(userUpdated)
      await storageUserSave(userUpdated)
    } catch (error) {
      throw error;
    }
  }

  //Load User Data from the device storage
  async function loadUserData() {
    try {
      setLoadingUser(true)

      const userLogged = await storageUserGet()
      const {token} = await storageAuthTokenGet()

      if (userLogged && token) {
        setUser(userLogged)
        userAndTokenUpdate(userLogged, token)
      }
    } catch (error) {
      throw error;
    }finally{
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut);

    return () => {
      subscribe()
    }
  },[signOut])

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signOut,
      updateUserProfile,
      loadingUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
}