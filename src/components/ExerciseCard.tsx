import React from "react"
import { Heading, HStack, Text, VStack, Image, Icon } from "native-base"
import { TouchableOpacity, TouchableOpacityProps } from "react-native"

import { MaterialIcons } from '@expo/vector-icons'

import { api } from "@services/api"

import { ExerciseDTO } from "@dtos/ExcerciseDTO"



type Props = TouchableOpacityProps & {
  data: ExerciseDTO
}

export function ExerciseCard({data,...rest}: Props){
  const img = "https://placehold.jp/150x150.png"

  return(
    <TouchableOpacity {...rest}>
      <HStack alignItems="center" background="gray.500" p={3} rounded="md" mb={4}>
        <Image 
          source={{uri: `${api.defaults.baseURL}/exercise/thumb/${data.thumb}`}}
          alt="Imagem do Exercício"
          w={16}
          h={16}
          rounded="md"
          resizeMode="cover"
        />

        <VStack flex={1} px={4}>
          <Heading fontSize="lg" color="white" fontFamily="heading">
            {data.name}
          </Heading>

          <Text fontSize="sm" color="gray.100" numberOfLines={2}>
            {data.series} séries x {data.repetitions} repetições
          </Text>
        </VStack>

        <Icon
          as={MaterialIcons}
          name="arrow-right"
          color="gray.100"
          size={7}
        />
      </HStack>
    </TouchableOpacity>
  )
}