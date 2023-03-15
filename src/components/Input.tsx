import React from 'react'
import { Input as DefaultInput, IInputProps, FormControl } from 'native-base'

type Props = IInputProps & {
  errorMessage?: string | null;
}

export function Input({ errorMessage = null, isInvalid, ...rest }: Props) {
  
  const invalid = !!errorMessage || isInvalid;

  return (
    <FormControl isInvalid={invalid} mb={4}>
      <DefaultInput
        bg="gray.400"
        borderColor="transparent"
        h={14}
        px={4}
        fontSize="md"
        color="white"
        fontFamily="body"
        placeholderTextColor="gray.300"
        isInvalid={invalid}
        _invalid={{
          borderColor: "red.700"
        }}
        _focus={{
          bg: "gray.700",
          borderColor: "green.500"
        }}
        {...rest}
      />

      <FormControl.ErrorMessage _text={{color: "red.700"}}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  )
}