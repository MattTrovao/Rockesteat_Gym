import React from "react"
import { Heading, HStack, Text, VStack, Image } from "native-base"

import { HistoryDTO } from "@dtos/HistoryDTO"
import { api } from "@services/api"

type Props = {
  data: HistoryDTO,
}

export function HistoryCard({ data }: Props){
  return(
    <HStack bg="gray.500" py={3} px={4} rounded="md" mb={4} alignItems="center">
      <VStack flex={1}>
        <Heading color='gray.200' fontWeight="bold" textTransform="capitalize" fontSize="sm" numberOfLines={1} fontFamily="heading">
          {data.group}
        </Heading>
        <Text color="gray.100" numberOfLines={1}>
          {data.name}
        </Text>
      </VStack>

      <Text color="gray.100">
        {data.hour}
      </Text>
    </HStack>
  )
}