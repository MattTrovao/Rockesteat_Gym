import React from 'react';
import { Button as DefaultButton, IButtonProps, Text} from 'native-base'

type Props = IButtonProps & {
  title: string;
  variant ?: 'solid' | 'outline';
}

export function Button({title, variant = 'solid', ...rest}: Props){
  return(
    <DefaultButton 
      w="full"
      h={14}
      bg={variant === "outline" ? "transparent" : "green.700"}
      borderWidth={variant === "outline" ? 1 : 0}
      borderColor="green.700"
      rounded={10}
      _pressed={{
        bg: variant === "outline" ? "gray.600" : "green.500"
      }}
      {...rest}
    >
      <Text 
        color={variant === "outline" ? "green.700" : "white"}
        fontFamily="heading" 
        fontSize="sm"
      >
        {title}
      </Text>
    </DefaultButton>
  )
}