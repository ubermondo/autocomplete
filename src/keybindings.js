import {getDefaultKeyBinding} from 'draft-js';

export function myKeyBindingFn(e: SyntheticKeyboardEvent): string {
  if (e.nativeEvent.shiftKey) {
    switch (e.keyCode) {
      case 51: return 'hashtag';
      case 50: return 'person';
      case 188: return 'relation_open';
      case 190: return 'relation_close';
      default: return getDefaultKeyBinding(e);
    }
  } else {
    return getDefaultKeyBinding(e);
  }
}
