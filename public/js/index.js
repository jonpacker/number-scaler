import _ from 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

export default function initAddFormPage(forms, form ) {
  const container = document.querySelector("#container");
  ReactDOM.render(<Component />, container);
}

class Component extends React.Component {
}
