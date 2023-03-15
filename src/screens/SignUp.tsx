import React, { useState } from "react"
import { VStack, Image, Center, Text, Heading, ScrollView, useToast } from "native-base"
import { useNavigation } from "@react-navigation/native"

import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAuth } from "@hooks/useAuth"


import * as yup from 'yup' 
import axios from "axios"
import { api } from '@services/api'

import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

import { AppError } from "@utils/AppError"

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'
import { Input } from "@components/Input"
import { Button } from "@components/Button"

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

const singUpSchema = yup.object({
  name: yup.string().required('Digite um nome'),
  email: yup.string().required('Digite um email').email('Email inválido'),
  password: yup.string().required('Digite uma senha').min(6, 'A senha deve ter 6 dígitos no mínimo'),
  password_confirm: yup.string().required('Confirme a senha').oneOf([yup.ref('password')], 'A confirmação da senha não confere')
})

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)

  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  const toast = useToast()

  const { signIn } = useAuth()


  const { control, handleSubmit, formState: {errors} } = useForm<FormDataProps>({
    resolver: yupResolver(singUpSchema)
  });

  function handleBackToLogin() {
    navigation.navigate('signIn')
  }

  async function handleSignUp({name, email, password}: FormDataProps) {
    try {
      setIsLoading(true)

      await api.post('/users', {name, email, password}); 
      
      await signIn(email, password)

    } catch (error) {
      setIsLoading(false)

      const isAppError = error instanceof AppError;

      const title = isAppError ? error.message : "Não foi possível criar conta"

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.800'
      })
    }

  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10}>
        <Image
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Imagem de background mostrando pessoas treinando"
          resizeMode="cover"
          position="absolute"
        />

        <Center mt={20} mb={12}>
          <LogoSvg />
          <Text color="gray.100" fontSize="sm">
            Lorem impsum dolor sit
          </Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Crie sua conta
          </Heading>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirmar a Senha"
                secureTextEntry
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}

              />
            )}
          />

          <Button 
            title="Criar e acessar" 
            onPress={handleSubmit(handleSignUp)} 
            isLoading={isLoading}
          />
        </Center>

        <Button title="Voltar ao Login" variant="outline" mt={8} onPress={handleBackToLogin} />
      </VStack>
    </ScrollView>
  )
}