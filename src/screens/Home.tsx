import React, { useCallback, useEffect, useState } from "react"
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { HStack, VStack, FlatList, Heading, Text, useToast } from "native-base";

import { api } from "@services/api";

import { AppNavigatorRoutesProp } from "@routes/app.routes";

import { HomeHeader } from "@components/HomeHeader";
import { Group } from "@components/Group";
import { ExerciseCard } from "@components/ExerciseCard";

import { AppError } from "@utils/AppError";

import { ExerciseDTO } from '@dtos/ExcerciseDTO'
import { Loading } from "@components/Loading";

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<string[]>([])
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])
  const [groupSelected, setGroupSelected] = useState('antebraço')

  const navigation = useNavigation<AppNavigatorRoutesProp>()

  const toast = useToast()

  function handleOpenExercise(exerciseID: string) {
    navigation.navigate('exercise',{
      exerciseID,
    });
  }

  async function fetchGroups() {
    try {
      setIsLoading(true)
      const response = await api.get('/groups');
      setGroups(response.data);
      
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível realizar o carregamento'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.800'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchExercisesByGroup() {
    try {
      setIsLoading(true)
      const response = await api.get(`/exercises/bygroup/${groupSelected}`);
      setExercises(response.data);

    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível realizar o carregamento dos exercícios'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.800'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  useFocusEffect(useCallback(() => {
    fetchExercisesByGroup()
  }, [groupSelected]))

  return (
    <VStack flex={1}>
      <HomeHeader />

      <FlatList
        my={4}
        minH={10}
        maxH={10}
        data={groups}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{ px: 8, }}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={groupSelected === item}
            onPress={() => setGroupSelected(item)}
          />
        )}
      />


      {isLoading ?
        <Loading /> :
        <VStack px={8} flex={1}>
          <HStack justifyContent="space-between" mb={2}>
            <Heading color="gray.200" fontSize="md" fontFamily="heading">
              Lista de Exercícíos
            </Heading>
            <Text color="green.400" fontSize="sm">
              ({exercises.length})
            </Text>
          </HStack>

          <FlatList
            mb={4}
            data={exercises}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            _contentContainerStyle={{ pb: 20, }}
            renderItem={({ item }) => (
              <ExerciseCard onPress={() => handleOpenExercise(item.id)} data={item} />
            )}
          />

        </VStack>
      }
    </VStack>
  )
}