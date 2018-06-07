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
      dry: [],
      wet: [],
      scaleBase: 0,
      scaleValue: '',
      scaleValueText: '',
      recipeName: '',
      saved: JSON.parse(localStorage.getItem("numberscaler_saved") || "[]")
    };
  }

  updateLine(dry, index, line) {
    const key = dry ? 'dry' : 'wet';
    this.setState( {
      [key]: this.state[key].map((numberLine, i) => {
        if (index == i) return line;
        return numberLine;
      })
    })
  }

  addLine(dry) {
    const key = dry ? 'dry' : 'wet';
    this.setState({
      [key]: [...this.state[key], {ingredient: '', amount: '', unit: dry ? 'kg' : 'L', amountNumber: 0}]
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

  removeLine(dry, index) {
    const key = dry ? 'dry' : 'wet';
    this.setState({
      [key]: this.state[key].filter((numberLine, i) => {
        return i != index;
      })
    })
  }

  setScaleValue(value) {
    let number = parseFloat(value);
    this.setState({scaleValue:number, scaleValueText:value});
  }

  setScaleBase(value) {
    this.setState({scaleBase:value});
  }

  render() {
    const allIngredients = this.state.wet.concat(this.state.dry);
    const wetTotal = this.state.wet.reduce((sum, line) => {
      let amt = isNaN(line.amountNumber) ? 0 : line.amountNumber;
      if (line.unit == 'g' || line.unit == 'ml') amt = amt / 1000;
      return sum + amt;
    }, 0);
    return <div className="scaler">
      <div className="wet">
        <h3>Wet Ingredients</h3>
        { this.state.wet.map((line, i) => {
            return <div key={i} >
              <IngredientLine {...line} defaultUnit="L" onChange={updatedLine => this.updateLine(false, i, updatedLine)} />
              <button onClick={e => this.removeLine(false, i)}>Remove</button>
            </div>
        })}
        <button onClick={() => this.addLine(false)}>Add Ingredient</button>
      </div>
      <div className="dry">
        <h3>Dry Ingredients</h3>
        { this.state.dry.map((line, i) => {
            return <div key={i} >
              <IngredientLine {...line} defaultUnit="kg" onChange={updatedLine => this.updateLine(true, i, updatedLine)} />
              <button onClick={e => this.removeLine(true, i)}>Remove</button>
            </div>
        })}
        <button onClick={() => this.addLine(true)}>Add Ingredient</button>
      </div>
      <hr/>
      { allIngredients.length > 0 && allIngredients[0].amount != '' &&
        <div className="scale-results">
          <label htmlFor="ingredient-key">Scale</label>
          <select id="ingredient-key" value={this.state.scaleBase} onChange={e => this.setScaleBase(e.target.value)}>
            { allIngredients.map((line, i) => {
                return <option key={i} value={i}>{line.amount}{line.unit} {line.ingredient}</option>;
            })}
            <option value="-1" data-is-total="true">Total Wet Volume ({wetTotal}L)</option>
          </select>
          to <input type="text" value={this.state.scaleValueText} onChange={e => this.setScaleValue(e.target.value)}/>
          { !!this.state.scaleValue &&
            allIngredients.map((line, i) => {
              const mult = this.state.scaleValue / (this.state.scaleBase == -1 ? wetTotal : allIngredients[this.state.scaleBase].amountNumber)
              const scaled = line.amountNumber * mult;
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
      unit: props.unit || props.defaultUnit,
      amountNumber: props.amountNumber
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      ingredient: props.ingredient,
      amount: props.amount,
      amountNumber: props.amountNumber,
      unit: props.unit
    });
  }

  set(prop, val) {
    this.setState({[prop]: val});
    this.props.onChange({ ...this.state, [prop]: val });
  }

  setAmount(val) {
    const update = {
      amount: val,
      amountNumber: parseFloat(val)
    };
    this.setState(update);
    this.props.onChange({ ...this.state, ...update });
  }

  render() {
    return <span className="ingredient-line">
      <input type="text" placeholder="0" value={this.state.amount} onChange={e => this.setAmount(e.target.value)} />
      <select onChange={e => this.set('unit', e.target.value)} value={this.state.unit}>
        <option value="kg">kg</option>
        <option value="g">g</option>
        <option value="ml">ml</option>
        <option value="L">L</option>
      </select>
      <input type="text" placeholder="ingredient" value={this.state.ingredient} onChange={e => this.set('ingredient', e.target.value)} />
    </span>;
  }
}

initPage();
