import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from "@react-navigation/native";
import { VStack, Image, Text, Center, Heading, ScrollView, useToast } from "native-base";

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import {useAuth} from '@hooks/useAuth'

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { AppError } from '@utils/AppError';

type FormData = {
  email: string;
  password: string;
}

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth();
  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const toast = useToast()

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>()

  function handleNewAccount() {
    navigation.navigate('signUp');
  }

  async function handleSignIn({ email, password }: FormData){
    try {
      setIsLoading(true)
      await signIn(email, password);
    } catch (error) {
      const isAppError = error instanceof AppError;

      const title = isAppError ? error.message : 'Algum erro ocorreu. Tenta mais tarde'

      setIsLoading(false)

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.800'
      })
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <VStack flex={1} px={10} pb={16}>
        <Image 
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
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
            Acesse a conta
          </Heading>

          <Controller 
            control={control}
            name="email"
            rules={{ required: 'Informe o e-mail' }}
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="E-mail" 
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />
          
          <Controller 
            control={control}
            name="password"
            rules={{ required: 'Informe a senha' }}
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="Senha" 
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
                onSubmitEditing={handleSubmit(handleSignIn)}
              />
            )}
          />

          <Button title="Acessar" onPress={handleSubmit(handleSignIn)} isLoading={isLoading}/>
        
        </Center>

        <Center mt={10}>
          <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
            Ainda não tem acesso?
          </Text>

          <Button 
            title="Criar Conta" 
            variant="outline"
            onPress={handleNewAccount}
          />
        </Center>
      </VStack>
    </ScrollView>
  );
}