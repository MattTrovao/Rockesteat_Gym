import React, { useState } from "react"

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';
import * as yup from 'yup'

import { TouchableOpacity } from "react-native";
import { Center, ScrollView, Skeleton, VStack, Text, useToast } from "native-base";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { api } from "@services/api";

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { useAuth } from "@hooks/useAuth";
import { AppError } from "@utils/AppError";

import defaultUser from '@assets/userPhotoDefault.png';
const PHOTO_SIZE = 24

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  old_password: string;
  confirm_password: string;
}

const profileSchema = yup.object({
  name: yup.string().required('Informe um Nome'),
  password: yup
    .string()
    .min(6, 'A senha deve ter 6 dígitos no mínimo')
    .nullable()
    .transform((value) => !!value ? value : null),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => !!value ? value : null)
    .oneOf([yup.ref('password')], 'A confirmação da senha não confere')
    .when('password', {
      is: (Field: any) => Field,
      then: (schema) => 
        schema.nullable()
        .required('Informe a confirmação da senha.')
        .transform((value) => !!value ? value : null),
    })
})

export function Profile() {
  const [isLoading, setIsLoading] = useState(false)

  const [imgIsLoading, setImgLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState('https://github.com/MattTrovao.png')

  const toast = useToast()

  const { user, updateUserProfile } = useAuth();

  //Form controler
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema)
  });

  //Try to update user informations
  async function handleProfileUpdate( data:FormDataProps ) {
    try {
      setIsLoading(true)

      const userUpdated = user
      userUpdated.name = data.name

      await api.put('/users', data)

      await updateUserProfile(userUpdated)

      toast.show({
        title: 'Perfil atulizado com sucesso!',
        placement: 'top',
        bgColor: 'green.800'
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível atualizar seus dados.'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.800'
      })
    } finally{
      setIsLoading(false)
    }
  }

  //Change User Picture
  async function handleUserPhotoSelect() {
    setImgLoading(true)
    try {
      const newPhoto = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if (newPhoto.cancelled) {
        return;
      }

      if (newPhoto.uri) {
        const photoInfo = await FileSystem.getInfoAsync(newPhoto.uri);

        if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 5) {
          // return Alert.alert("Imagem maior que tua mãe. Escolhe uma mais leve")
          return toast.show({
            title: 'Imagem maior que tua mãe. Escolhe uma mais leve',
            placement: 'top',
            bgColor: 'red.800'
          })
        }

        const fileExtension = newPhoto.uri.split('.').pop();
        const photoFile = {
          name: `${user.name.replace(/\s/g, "-").toUpperCase()}_PROFILE.${fileExtension?.toLowerCase()}`,
          uri: newPhoto.uri,
          type: `${newPhoto.type}/${fileExtension}`
        } as any

        const userPhotoUploadForm = new FormData();
        userPhotoUploadForm.append('avatar', photoFile)

        const avatarResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const userUpdated = user;
        userUpdated.avatar = avatarResponse.data.avatar
        updateUserProfile(userUpdated)

        toast.show({
          title: 'Foto atulizado com sucesso!',
          placement: 'top',
          bgColor: 'green.800'
        })
      }
    } catch (error) {
      console.log(error);
    } finally {
      setImgLoading(false)
    }
  }


  return (
    <VStack>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Center my={6} px={10}>
          {
            imgIsLoading ?
              <Skeleton
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded="full"
                startColor="gray.200"
                endColor="gray.300"
              />
              :
              <UserPhoto
                source={
                  user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : defaultUser
                }
                alt="Imagem do usuário"
                size={PHOTO_SIZE}
              />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text mt={2} mb={8} color="green.500" fontWeight="bold">
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="Nome do Usuário"
                bg="gray.600"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder="email@email.com"
                bg="gray.600"
                isDisabled
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </Center>

        <VStack px={10}>
          <Text mb={8} color="gray.100" fontWeight="bold">
            Alterar senha
          </Text>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Senha Atual"
                bg="gray.600"
                onChangeText={onChange}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Nova senha"
                bg="gray.600"
                onChangeText={onChange}
                secureTextEntry
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Repetir senha"
                bg="gray.600"
                onChangeText={onChange}
                secureTextEntry
                onSubmitEditing={handleSubmit(handleProfileUpdate)}
                errorMessage={errors.confirm_password?.message}

              />
            )}
          />

          <Button title="Atualizar" mt={5} onPress={handleSubmit(handleProfileUpdate)} isLoading={isLoading}/>
        </VStack>
      </ScrollView>
    </VStack>
  )
}