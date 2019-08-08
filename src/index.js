import React from 'react';
import ReactDOM from 'react-dom';
import Board from './components/board.js';
import './style.css';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 10,
      width: 10,
      mines: 50
    };
  }
  render() {
    const { height, width, mines } = this.state;
    return (
      <div className="game">
        <div className="game-info">
          Minesweeper: Prepare to Die Edition ☠️
          <Board height={height} width={width} mines={mines} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));