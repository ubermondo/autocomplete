import React from 'react';
import {Editor} from 'draft-js';
import * as triggers from './triggers';

class AutocompleteEditor extends Editor {
  constructor(props) {
    super(props);
    this.autocompleteState = null;
    this.onChange = (editorState) => {
      const {onChange, onAutocompleteChange} = this.props;
      onChange(editorState);
      if (onAutocompleteChange) {
        window.requestAnimationFrame(() => {
          onAutocompleteChange(this.getAutocompleteState());
        });
      };
    };
    this.onArrow = (e, originalHandler, nudgeAmount) => {
      const {onAutocompleteChange} = this.props;
      let autocompleteState = this.getAutocompleteState(false);
      if (!autocompleteState) {
        if (originalHandler) {
          originalHandler(e);
        }
        return;
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
      //const contentState = editorState.getCurrentContent();
    };
    this.onDownArrow = (e) => {
      this.onArrow(e, this.props.onDownArrow, 1);
    };
    this.onEscape = (e) => {
      const {onEscape, onAutocompleteChange} = this.props;
      if (!this.getAutocompleteState(false)) {
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
      this.commitSelection(e)
    };
    this.handleReturn = (e) => {
      return this.commitSelection(e);
    }
  }
  commitSelection(e) {
    const {onAutocompleteChange} = this.props;
    let autocompleteState = this.getAutocompleteState(false);
    if (!autocompleteState) {
      return false;
    }
    e.preventDefault();
    this.onSuggestionSelect();
    this.autocompleteState = null;
    if (onAutocompleteChange) {
      onAutocompleteChange(null);
    }
    return true;
  };
  onSuggestionSelect() {
    let autocompleteState = this.getAutocompleteState(false);
    const insertState = this.getInsertState(autocompleteState.selectedIndex, autocompleteState.trigger);
    const {onInsert} = this.props;
    const newEditorState = onInsert(insertState);
    const {onChange} = this.props;
    onChange(newEditorState);
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
  getAutocompleteState(invalidate = true) {
    if (!invalidate) {
      return this.autocompleteState;
    }
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
      let hashtagStart = (hashtagRange && hashtagRange.hasOwnProperty("start"))
        ? hashtagRange.start
        : 0;
      let personStart = (personRange && personRange.hasOwnProperty("start"))
        ? personRange.start
        : 0;
      let relationStart = (relationRange && relationRange.hasOwnProperty("start"))
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
    }
    const tempRange = window.getSelection().getRangeAt(0).cloneRange();
    tempRange.setStart(tempRange.startContainer, range.start);
    const rangeRect = tempRange.getBoundingClientRect();
    let [left, top] = [rangeRect.left, rangeRect.bottom];
    this.autocompleteState = {
      trigger,
      type,
      left,
      top,
      text: range.text,
      selectedIndex: 0
    };
    return this.autocompleteState;
  };
  render() {
    const {editorState} = this.props;
    return (<Editor editorState={editorState} handleReturn={this.handleReturn} onChange={this.onChange} onEscape={this.onEscape} onUpArrow={this.onUpArrow} onDownArrow={this.onDownArrow} onTab={this.onTab}/>);
  }
}

export default AutocompleteEditor;
