import React, { useEffect, useState } from "react"
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppNavigatorRoutesProp } from "@routes/app.routes";

import { Text, VStack, Icon, HStack, Heading, Image, Center, Box, ScrollView, useToast } from "native-base";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'
import { Button } from "@components/Button";

import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import { ExerciseDTO } from "@dtos/ExcerciseDTO";
import { Loading } from "@components/Loading";


type RouteParamsProps = {
  exerciseID: string;
}

export function Exercise() {
  const [isLoading, setIsLoading] = useState(true);
  const [submitRegister, setSubmitRegister] = useState(false)
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)


  const navigation = useNavigation<AppNavigatorRoutesProp>()
  function handleGoBack() {
    navigation.goBack();
  }

  const route = useRoute()
  const toast = useToast()

  const { exerciseID } = route.params as RouteParamsProps

  async function fetchExerciseByID() {
    try {
      setIsLoading(true)
      const response = await api.get(`/exercises/${exerciseID}`);
      setExercise(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível realizar o carregamento do exercício'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.800'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleExerciseHistoryRegister(){
    try {
      setSubmitRegister(true)
      await api.post('/history', {exercise_id : exerciseID})

      toast.show({
        title: 'Exércicio registrado com sucesso!',
        placement: 'top',
        bgColor: 'green.800'
      })


      navigation.navigate('history')
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível registrar o exercício'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.800'
      })
    } finally {
      setSubmitRegister(false)
    }
  }

  useEffect(() => {
    fetchExerciseByID()
  }, [exerciseID])

  return (
    <VStack flex={1}>
      {isLoading ? <Loading /> :
        <>
          <VStack px={4} pt={10} pb={4} bg="gray.600">
            <TouchableOpacity onPress={handleGoBack}>
              <Icon
                as={MaterialIcons}
                name="arrow-left"
                color="green.300"
                size={8}
              />
            </TouchableOpacity>

            <HStack mt={5} px={4} alignItems="center" justifyContent="space-between">
              <Heading color="gray.200" fontSize="lg" textTransform="capitalize" flexShrink={1}>
                {exercise.name}
              </Heading>

              <HStack alignItems="center">
                <Icon
                  as={MaterialIcons}
                  name="fitness-center"
                  color="gray.200"
                  size={6}
                />
                <Text color="gray.200" ml={2} textTransform="capitalize">
                  {exercise.group}
                </Text>
              </HStack>
            </HStack>
          </VStack>

          <ScrollView >
            <VStack mt={6} px={9}>
              <Box rounded="md" mb={3} overflow="hidden">
                <Image
                  source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                  alt="Imagem do exercício"
                  w="full"
                  h={280}
                  rounded="md"
                  resizeMode="cover"
                />
              </Box>

              <Box mt={8} bg="gray.600" p={4} rounded="md">
                <HStack alignItems="center" justifyContent="center" space={5}>
                  <HStack alignItems="center" space={2}>
                    <Icon
                      as={MaterialIcons}
                      name="redo"
                      color="green.500"
                      size={4}
                    />

                    <Text color="gray.200">
                      {exercise.series} séries
                    </Text>
                  </HStack>

                  <HStack alignItems="center" space={2}>
                    <Icon
                      as={MaterialIcons}
                      name="replay"
                      color="green.500"
                      size={6}
                    />

                    <Text color="gray.200">
                      {exercise.repetitions} repetições
                    </Text>
                  </HStack>
                </HStack>

                <Button 
                  title="Marcar como Realizado" 
                  mt={4} 
                  isLoading={submitRegister}
                  onPress={() => handleExerciseHistoryRegister()}
                />
              </Box>
            </VStack>
          </ScrollView>
        </>
      }
    </VStack>
  )
}