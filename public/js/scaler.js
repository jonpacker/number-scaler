import _ from 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

function initPage() {
  const container = document.querySelector("#scaler");
  ReactDOM.render(<Scaler />, container);
}

class Scaler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numbers: [],
      scaleKey: 0,
      scaleValue: '',
      recipeName: '',
      saved: JSON.parse(localStorage.getItem("numberscaler_saved") || "[]")
    };
  }

  updateLine(index, line) {
    this.setState( {
      numbers: this.state.numbers.map((numberLine, i) => {
        if (index == i) return line;
        return numberLine;
      })
    })
  }

  addLine() {
    this.setState({
      numbers: [...this.state.numbers, {ingredient: '', amount: '', unit: 'kg'}]
    });
  }

  saveCurrent() {
    const key = `${new Date().toString()} - ${this.state.recipeName || 'Unnamed'}`;
    const currentSaved = JSON.parse(localStorage.getItem("numberscaler_saved") || "[]");
    currentSaved.push({...this.state, saved: undefined, key});
    localStorage.setItem("numberscaler_saved", JSON.stringify(currentSaved));
    this.setState({saved: currentSaved});
  }

  load(saved) {
    this.setState(saved);
  }

  render() {
    return <div className="scaler">
      { this.state.numbers.map((line, i) => {
          return <IngredientLine {...line} key={i} onChange={updatedLine => this.updateLine(i, updatedLine)} />
      })}
      <button onClick={() => this.addLine()}>Add Ingredient</button>
      <hr/>
      { this.state.numbers.length > 0 && this.state.numbers[0].amount != '' &&
        <div className="scale-results">
          <label htmlFor="ingredient-key">Scale</label>
          <select id="ingredient-key" value={this.state.scaleKey} onChange={e => this.setState({scaleKey: e.target.value})}>
            { this.state.numbers.map((line, i) => {
                return <option key={i} value={i}>{line.amount}{line.unit} {line.ingredient}</option>;
            })}
          </select>
          to <input type="text" value={this.state.scaleValue} onChange={e => this.setState({scaleValue: parseFloat(e.target.value)})}/>
          { !!this.state.scaleValue &&
            this.state.numbers.map((line, i) => {
              const scaled = line.amount * (this.state.scaleValue / this.state.numbers[this.state.scaleKey].amount);
              return <div key={i} className="scaledIngredientLine">
                <strong>{scaled.toFixed(1)}{line.unit}</strong> {line.ingredient}
              </div>
            })
          }
          <hr/>
          <input type="text" placeholder="Recipe Name" value={this.state.recipeName} onChange={e => this.setState({recipeName: e.target.value})} />
          <button onClick={() => this.saveCurrent()}>Save</button>
        </div>
      }
      <hr/>
      <h5>Previously saved</h5>
      { this.state.saved.map(saved =>
        <div>
          <a onClick={e => this.load(saved)}>{saved.key}</a>
        </div>
      ) }
    </div>;
  }
}

class IngredientLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredient: props.ingredient,
      amount: props.amount,
      unit: props.unit
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      ingredient: props.ingredient,
      amount: props.amount,
      unit: props.unit
    });
  }

  set(prop, val) {
    this.setState({[prop]: val});
    this.props.onChange({ ...this.state, [prop]: val });
  }

  setAmount(val) {
    try {
      val = parseFloat(val);
    } catch (e) {}
    this.set('amount', val);
  }

  render() {
    return <div className="ingredient-line">
      <input type="text" placeholder="0" value={this.state.amount} onChange={e => this.setAmount(e.target.value)} />
      <select onChange={e => this.set('unit', e.target.value)} value={this.state.unit}>
        <option value="kg">kg</option>
        <option value="L">L</option>
      </select>
      <input type="text" placeholder="ingredient" value={this.state.ingredient} onChange={e => this.set('ingredient', e.target.value)} />
    </div>;
  }
}

initPage();
