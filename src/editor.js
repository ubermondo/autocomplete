import React from 'react';
import {Editor, EditorState} from 'draft-js';
import {myKeyBindingFn} from './keybindings';
import * as suggestions from './suggestions';

class AutocompleteEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.isSuggesting = false;
  }
  handleKeyCommand(command: string): DraftHandleValue {
    if ((['hashtag','person'].indexOf(command) !== -1) || ((command.indexOf("_close") !== -1) && this.isSuggesting)) {
      this.isSuggesting = false;
      this.offerSuggestions(command.split("_").shift());
    } else if (command.indexOf("_open") !== -1) {
      this.isSuggesting = true;
      return 'handled';
    } else {
      this.isSuggesting = false;
      return 'not-handled';
    }
  }
  offerSuggestions(suggestionType: string) {
    console.log(suggestions[suggestionType]);
    return 'handled';
  }
  render() {
    return (<Editor
      editorState={this.state.editorState}
      onChange={this.onChange}
      handleKeyCommand={this.handleKeyCommand}
      keyBindingFn={myKeyBindingFn}
    />);
  }
}

export default AutocompleteEditor;
