import React from 'react';

export default props => (
  <div
    onClick={props.onClick}
    className={`${props.className} ${props.attributes.suit && (['S', 'C'].indexOf(props.attributes.suit) > -1 ? 'black' : 'red') || 'facedown'}`}
  >
    {props.attributes.number}
    {{ S: '♠', H: '♥', D: '♦', C: '♣' }[props.attributes.suit]}
  </div>
);
