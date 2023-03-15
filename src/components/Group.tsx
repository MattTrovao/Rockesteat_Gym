import { Text, Pressable, IPressableProps } from "native-base";
import React from "react";

type Props = IPressableProps & {
  name: string,
  isActive: boolean
}

export function Group({ name, isActive, ...rest }: Props) {
  return (
    <Pressable
      mr={4}
      w={24}
      h={38}
      bg="gray.600"
      rounded="md"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      borderWidth={2}
      borderColor="transparent"
      isPressed={isActive}
      _pressed={{
        borderColor: "green.500",
      }}
      {...rest}
    >
      <Text
        color={isActive ? "green.500" : "gray.200"}
        textTransform="capitalize"
        fontSize="xs"
        fontWeight="bold"
      >
        {name}
      </Text>
    </Pressable>
  )
}