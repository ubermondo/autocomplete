import React from 'react';
import {normalizeIndex} from './utils';

class SuggestionList extends React.Component {
  render() {
    const {suggestionsState} = this.props;
    const {left, top, array, selectedIndex} = suggestionsState;
    const style = Object.assign({}, {left, top});
    if (!array) {
      return null;
    }
    const normalizedIndex = normalizeIndex(selectedIndex, array.length);
    return (<ul className="suggestionList" style={style}>{
        array.map((item, index) => {
          const cssClass = (index === normalizedIndex)
            ? "selected"
            : "";
          return (<li key={item} className={cssClass}>{item}</li>);
        }, this)
      }</ul>);
  }
}

export default SuggestionList;
