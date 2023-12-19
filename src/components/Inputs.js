import {View, Text, TextInput, StyleSheet} from 'react-native';
import React from 'react';

export default function Inputs({
  label,
  outlined,
  placeholder,
  leftIcon,
  rightIcon,
  numLines,
  onChangeHnadler,
  secure,
  validate,
  errorColor,
  errorMessage,
  bgColor = 'white',
}) {
  const containerBorder = outlined ? styles.outlined : styles.standard;
  return (
    <View style={{padding: 10}}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.container, containerBorder, {backgroundColor: bgColor}]}>
        {leftIcon}
        <TextInput
          secureTextEntry={secure}
          placeholder={
            placeholder ? placeholder : label ? `Enter ${label}` : ''
          }
          onChange={onChangeHnadler}
          onEndEditing={validate}
          multiline={numLines > 1}
          numberOfLines={numLines}
          style={{flex: 4}}
        />
        {rightIcon}
      </View>
      <Text style={{color: errorColor}}>{errorMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: "500",
  },
  container: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  outlined: {
    borderColor: 'darkgrey',
    borderRadius: 4,
    borderWidth: 1,
  },
  standard: {
    borderColor: 'darkgrey',
    borderBottomWidth: 1,
  },
});
