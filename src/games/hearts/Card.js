import React from 'react';

export default props => (
  <div
    onClick={props.onClick}
    className={`${props.className} ${['S', 'C'].indexOf(props.attributes.suit) > -1 ? 'black' : 'red'}`}
  >
    {props.attributes.number}
    {{ S: '♠', H: '♥', D: '♦', C: '♣' }[props.attributes.suit]}
  </div>
);
