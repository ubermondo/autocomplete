import React from 'react';
import {Editor} from 'draft-js';
import * as triggers from './triggers';

class Autocompleter extends React.Component {
  constructor(props) {
    super(props);
    this.autocompleteState = null;
    this.onChange = (editorState) => {
      const {onChange, onAutocompleteChange} = this.props;
      onChange(editorState);
      if (onAutocompleteChange) {
        window.requestAnimationFrame(() => {
          onAutocompleteChange(this.createNewAutocompleteState());
        });
      };
    };
    this.onArrow = (e, originalHandler, nudgeAmount) => {
      const {onAutocompleteChange} = this.props;
      let autocompleteState = this.getCurrentAutocompleteState();
      if (!autocompleteState) {
        if (originalHandler) {
          originalHandler(e);
        }
        return "not-handled";
      }
      e.preventDefault();
      autocompleteState.selectedIndex += nudgeAmount;
      this.autocompleteState = autocompleteState;
      if (onAutocompleteChange) {
        onAutocompleteChange(autocompleteState);
      }
    };
    this.onUpArrow = (e) => {
      this.onArrow(e, this.props.onUpArrow, -1);
    };
    this.onDownArrow = (e) => {
      this.onArrow(e, this.props.onDownArrow, 1);
    };
    this.onEscape = (e) => {
      const {onEscape, onAutocompleteChange} = this.props;
      if (!this.getCurrentAutocompleteState()) {
        if (onEscape) {
          onEscape(e);
        }
        return;
      }
      e.preventDefault();
      this.autocompleteState = null;
      if (onAutocompleteChange) {
        onAutocompleteChange(null);
      }
    };
    this.onTab = (e) => {
      this.commitSelection(e);
    };
    this.handleReturn = (e) => {
      this.commitSelection(e);
    }
    this.keyBindingFn = (e) => {
      if (e.keyCode === 32) {
        this.commitSelection(e);
      }
    }
  }
  commitSelection(e) {
    const {onAutocompleteChange} = this.props;
    let autocompleteState = this.getCurrentAutocompleteState();
    if (!autocompleteState) {
      return "not-handled";
    }
    e.preventDefault();
    this.onSuggestionSelect();
    this.autocompleteState = null;
    if (onAutocompleteChange) {
      onAutocompleteChange(null);
    }
    return "handled";
  };
  onSuggestionSelect() {
    let autocompleteState = this.getCurrentAutocompleteState();
    const insertState = this.getInsertState(
      autocompleteState.selectedIndex,
      autocompleteState.trigger
    );
    const newEditorState = this.props.onInsert(insertState);
    this.props.onChange(newEditorState);
  };
  getInsertState(selectedIndex, trigger) {
    const {editorState} = this.props;
    const currentSelectionState = editorState.getSelection();
    const end = currentSelectionState.getAnchorOffset();
    const anchorKey = currentSelectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(anchorKey);
    const blockText = currentBlock.getText();
    const start = blockText.substring(0, end).lastIndexOf(trigger);
    return {editorState, start, end, trigger, selectedIndex}
  }
  hasEntityAtSelection() {
    const {editorState} = this.props;
    const selection = editorState.getSelection();
    if (!selection.getHasFocus()) {
      return false;
    }
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    return !!block.getEntityAt(selection.getStartOffset() - 1);
  };
  getAutocompleteRange(trigger) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    }
    if (this.hasEntityAtSelection()) {
      return null;
    }
    const range = selection.getRangeAt(0);
    let text = range.startContainer.textContent;
    text = text.substring(0, range.startOffset);
    const index = text.lastIndexOf(trigger);
    if (index === -1) {
      return null;
    }
    text = text.substring(index);
    return {text, start: index, end: range.startOffset};
  };
  createNewAutocompleteState() {
    let type = null;
    let trigger = null;
    const hashtagRange = this.getAutocompleteRange(triggers.HASHTAG_TRIGGER);
    const personRange = this.getAutocompleteRange(triggers.PERSON_TRIGGER);
    const relationRange = this.getAutocompleteRange(triggers.RELATION_TRIGGER);
    if ((!hashtagRange && !personRange) && !relationRange) {
      this.autocompleteState = null;
      return null;
    }
    let range = null;
    if (!hashtagRange && !relationRange) {
      range = personRange;
      type = triggers.PERSON;
      trigger = triggers.PERSON_TRIGGER;
    }
    if (!personRange && !relationRange) {
      range = hashtagRange;
      type = triggers.HASHTAG;
      trigger = triggers.HASHTAG_TRIGGER;
    }
    if (!personRange && !hashtagRange) {
      range = relationRange;
      type = triggers.RELATION;
      trigger = triggers.RELATION_TRIGGER;
    }
    if (!range) {
      const hashtagStart = (hashtagRange && hashtagRange.hasOwnProperty("start"))
        ? hashtagRange.start
        : 0;
      const personStart = (personRange && personRange.hasOwnProperty("start"))
        ? personRange.start
        : 0;
      const relationStart = (relationRange && relationRange.hasOwnProperty("start"))
        ? relationRange.start
        : 0;
      if ((hashtagStart > personStart) && (hashtagStart > relationStart)) {
        range = hashtagRange;
        type = triggers.HASHTAG;
        trigger = triggers.HASHTAG_TRIGGER;
      } else if ((personStart > hashtagStart) && (personStart > relationStart)) {
        range = personRange;
        type = triggers.PERSON;
        trigger = triggers.PERSON_TRIGGER;
      } else {
        range = relationRange;
        type = triggers.RELATION;
        trigger = triggers.RELATION_TRIGGER;
      }
    };
    const tempRange = window.getSelection().getRangeAt(0).cloneRange();
    tempRange.setStart(tempRange.startContainer, range.start);
    const rangeRect = tempRange.getBoundingClientRect();
    this.autocompleteState = {
      trigger,
      type,
      left: rangeRect.left,
      top: rangeRect.bottom,
      text: range.text,
      selectedIndex: 0
    };
    return this.autocompleteState;
  };
  getCurrentAutocompleteState() {
    return this.autocompleteState;
  };
  render() {
    const {editorState} = this.props;
    return (
      <Editor
        editorState={editorState}
        handleReturn={this.handleReturn}
        keyBindingFn={this.keyBindingFn}
        onChange={this.onChange}
        onEscape={this.onEscape}
        onUpArrow={this.onUpArrow}
        onDownArrow={this.onDownArrow}
        onTab={this.onTab}
      />
    );
  }
}

export default Autocompleter;
