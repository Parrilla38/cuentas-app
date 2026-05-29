import { Alert, Platform } from 'react-native'

export function showAlert(title: string, message?: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title
    window.alert(text)
    if (onOk) onOk()
  } else {
    if (onOk) {
      Alert.alert(title, message, [{ text: 'OK', onPress: onOk }])
    } else {
      Alert.alert(title, message)
    }
  }
}

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Confirmar',
  destructive = false,
) {
  if (Platform.OS === 'web') {
    const text = `${title}\n\n${message}`
    if (window.confirm(text)) {
      onConfirm()
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ])
  }
}
