import {Entity, Modifier, EditorState} from 'draft-js';

const addSuggestion = ({editorState, start, end, trigger, text}) => {
  const entityKey = Entity.create('SUGGESTION', 'IMMUTABLE', "http://google.com");
  const currentSelectionState = editorState.getSelection();
  const suggestionTextSelection = currentSelectionState.merge({anchorOffset: start, focusOffset: end});

  let insertingContent = Modifier.replaceText(editorState.getCurrentContent(), suggestionTextSelection, text, [
    'link', 'BOLD'
  ], entityKey);

  const blockKey = suggestionTextSelection.getAnchorKey();
  const blockSize = editorState.getCurrentContent().getBlockForKey(blockKey).getLength();
  if (blockSize === end) {
    insertingContent = Modifier.insertText(insertingContent, insertingContent.getSelectionAfter(), ' ');
  }

  const newEditorState = EditorState.push(editorState, insertingContent, 'insert-suggestion');

  return EditorState.forceSelection(newEditorState, insertingContent.getSelectionAfter());
};

export default addSuggestion;
