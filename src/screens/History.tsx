import React, { useCallback, useState } from "react"
import { Text, VStack, SectionList, useToast } from "native-base";

import { api } from "@services/api";

import { AppError } from "@utils/AppError";

import { ScreenHeader } from "@components/ScreenHeader";
import { HistoryCard } from "@components/HistoryCard";

import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO"
import { Loading } from "@components/Loading";
import { useFocusEffect } from "@react-navigation/native";

export function History() {
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([])
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast()

  async function fetchHistoryData() {
    try {
      setIsLoading(true);
      const response = await api.get('/history');
      setExercises(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchHistoryData()
    },[])
  )

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico" />


      {isLoading ? <Loading /> :
        <SectionList
          py={4}
          px={8}
          sections={exercises}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <HistoryCard data={item} /> }
          renderSectionHeader={({ section }) => (
            <Text color="gray.100" fontSize="sm" my={2}>
              {section.title}
            </Text>
          )}
          contentContainerStyle={exercises.length === 0 && { flex: 1, justifyContent: 'center' }}
          ListEmptyComponent={() => (
            <Text color="gray.100" fontSize="md" my={2} textAlign="center">
              Nenhum exercício cadastrado
            </Text>
          )}
        />
      }
    </VStack>
  )
}