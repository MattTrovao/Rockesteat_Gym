import React from "react"
import { Center, Heading } from "native-base";

type Props = {
  title: string
}

export function ScreenHeader({title}: Props){
  return(
    <Center bg="gray.600" pt={8} pb={5} alignItems="center">
      <Heading color="gray.100" fontSize="xl" fontFamily="heading">
        {title}
      </Heading>
    </Center>
  )
}