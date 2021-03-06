import React, {Component} from 'react';
import {EditorState} from 'draft-js';
import Autocompleter from './autocompleter';
import SuggestionList from './suggestionlist';
import {normalizeIndex, filterArray} from './utils';
import * as triggers from './triggers';
import * as data from './data';
import addSuggestion from './addsuggestion';

class App extends Component {
  constructor() {
    super();
    this.state = {
      editorState: EditorState.createEmpty()
    };
    this.filteredArrayTemp = [];
    this.onChange = (editorState) => this.setState({editorState});
    this.onAutocompleteChange = (autocompleteState) => this.setState({autocompleteState});
    this.onInsert = (insertState) => {
      const index = normalizeIndex(insertState.selectedIndex, this.filteredArrayTemp.length);
      insertState.text = insertState.trigger + this.filteredArrayTemp[index];
      return addSuggestion(insertState);
    };
  }
  renderAutocomplete() {
    const {autocompleteState} = this.state;
    if (!autocompleteState) {
      return null;
    }
    this.filteredArrayTemp = this.getFilteredArray(autocompleteState.type, autocompleteState.text);
    autocompleteState.array = this.filteredArrayTemp;
    autocompleteState.onSuggestionClick = this.onSuggestionItemClick;
    return <SuggestionList suggestionsState={autocompleteState}/>;
  }
  getFilteredArray(type, text) {
    const dataArray = ((tempType) => {
      switch (tempType) {
        case triggers.PERSON:
          return data.persons;
        case triggers.HASHTAG:
          return data.hashtags;
        default:
          return data.relations;
      }
    })(type);
    return filterArray(dataArray, text.replace(triggers.regExByType(type), ''));
  }
  render() {
    return (<div>
      {this.renderAutocomplete()}
      <div>
        <Autocompleter
          editorState={this.state.editorState}
          onChange={this.onChange}
          onAutocompleteChange={this.onAutocompleteChange}
          onInsert={this.onInsert}
        />
      </div>
    </div>);
  }
}

export default App;
