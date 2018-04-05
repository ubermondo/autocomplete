import React from 'react';
import {normalizeIndex} from './utils';

class SuggestionList extends React.Component {
  componentDidMount() {
    this.el.scrollIntoView({behavior: 'smooth'});
  }
  render() {
    const {suggestionsState} = this.props;
    const {left, top, array, selectedIndex} = suggestionsState;
    const style = {left, top};
    if (!array) {
      return null;
    }
    const normalizedIndex = normalizeIndex(selectedIndex, array.length);
    return (
      <ul
        className="suggestionList"
        style={style}
        ref={el => {this.el=el;}}
      >
        {
          array.map((item, index) => {
            const cssClass = (index === normalizedIndex)
              ? "selected"
              : "";
            return (<li key={item} className={cssClass}>{item}</li>);
          })
        }
      </ul>
    );
  }
}

export default SuggestionList;
