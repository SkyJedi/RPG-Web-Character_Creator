import React from 'react';
import '../index.css';

export default class Selection extends React.Component {
  state = {value: this.props.value};

  componentDidMount() {
    if (this.props.value === '') this.setState({value: Object.keys(this.props.data)[0]});
  }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    this.props.submit(this.state.value);
    event.preventDefault();
  }

  handleClear = (event) => {
    this.props.submit('');
    event.preventDefault();
  }

  render() {
    const {value} = this.state;
    const {data} = this.props;
    return (
    <div>
      <form onSubmit={this.handleSubmit}>
        <select value={value} className='popup-select' onChange={this.handleChange}>
        <option key='' value=''></option>
        {Object.keys(data).map((key)=>
          <option value={key} key={key}>{data[key].name}</option>
        )}
        </select>
        {data[value] &&
          <div>
            <br/>
            <p><b>Name:</b> {data[value].name}</p>
            <p><b>Tier:</b> {data[value].tier}</p>
            <p><b>Activation:</b> {data[value].activation ? 'Active' : 'Passive' }</p>
            {data[value].turn ?  <p>{data[value].turn}</p> : null}
            {data[value].ranked ? <p><b>Ranked</b></p> : <p><b>Not Ranked</b></p> }
            <p><b>Setting:</b> {data[value].setting}</p>
            <p><b>Description:</b> {data[value].description}</p>
          </div>
        }
        <input type='submit' value='Submit' />
        <button value='Clear' onClick={this.handleClear}>Clear</button>
      </form>


    </div>
    )
  }
}
