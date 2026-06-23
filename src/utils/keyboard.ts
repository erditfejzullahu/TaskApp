import { InteractionManager, Keyboard } from 'react-native';

const KEYBOARD_DISMISS_MS = 150;

/** Dismiss the keyboard and wait for the close animation before navigating. */
export const dismissKeyboardAndWait = (): Promise<void> =>
  new Promise(resolve => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      setTimeout(resolve, KEYBOARD_DISMISS_MS);
    });
  });
