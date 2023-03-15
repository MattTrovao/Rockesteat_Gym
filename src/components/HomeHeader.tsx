import React from "react";
import { useAuth } from "@hooks/useAuth";

import { Heading, HStack, Text, VStack, Icon } from "native-base";
import { MaterialIcons } from '@expo/vector-icons'

import { api } from "@services/api";

import { UserPhoto } from "./UserPhoto";
import { TouchableOpacity } from "react-native";

import defaultUser from '@assets/userPhotoDefault.png';


export function HomeHeader() {
  const { user, signOut } = useAuth()

  return (
    <HStack bg="gray.600" pt={16} pb={5} px={8} alignItems="center">
      <UserPhoto
        source={
          user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : defaultUser
        }
        alt="Imagem do usuário"
        size={16}
        mr={4}
      />

      <VStack flex={1}>
        <Text color="gray.100" fontSize="sm" fontFamily="heading">
          Olá,
        </Text>
        <Heading color="green.400" fontSize="md" fontFamily="heading" textTransform="capitalize">
          {user.name}
        </Heading>
      </VStack>

      <TouchableOpacity onPress={signOut}>
        <Icon
          as={MaterialIcons}
          name="logout"
          color="gray.100"
          size={7}
        />
      </TouchableOpacity>
    </HStack>
  )
}