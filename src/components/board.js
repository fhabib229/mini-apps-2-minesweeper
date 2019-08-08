import React from 'react';
import Square from './square.js';

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
      hasWon: false,
      mineCount: this.props.mines,
    }
  }

  getMines(data) {
    let mineArray = [];

    data.map(dataRow => {
      dataRow.map((dataItem) => {
        if (dataItem.isMine) {
          mineArray.push(dataItem);
        }
      });
    });

    return mineArray;
  }

  getFlags(data) {
    let flagArray = [];

    data.map(dataRow => {
      dataRow.map((dataItem) => {
        if (dataItem.isFlagged) {
          flagArray.push(dataItem);
        }
      });
    });

    return flagArray;
  }

  getHiddenSquares(data) {
    let hiddenSquaresArr = [];

    data.map(dataRow => {
      dataRow.map(dataItem => {
        if (!dataItem.isRevealed) {
          hiddenSquaresArr.push(dataItem);
        };
      });
    });

    return hiddenSquaresArr;
  }

  getRandomNum(dimension) {
    return Math.floor((Math.random() * 1000) + 1) % dimension;
  }

  initBoardData(height, width, mines) {
    let data = [];

    for (let i = 0; i < height; i++) {
      data.push([]);
      for (let j = 0; j < width; j++) {
        data[i][j] = {
          x: i,
          y: j,
          isMine: false,
          neighbour: 0,
          isRevealed: false,
          isEmpty: false,
          isFlagged: false,
        };
      }
    }

    data = this.plantMines(data, height, width, mines);
    data = this.getNeighbours(data, height, width);
    return data;
  }

  plantMines(data, height, width, mines) {
    let randomx, randomy, minesPlanted = 0;

    while(minesPlanted < mines) {
      randomx = this.getRandomNum(width);
      randomy = this.getRandomNum(height);
      if (!(data[randomx][randomy].isMine)) {
        data[randomx][randomy].isMine = true;
        minesPlanted++;
      }
    }

    return (data);
  }

  getNeighbours(data, height, width) {
    let updatedData = data, index = 0;

    for (let i  = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (data[i][j].isMine !== true) {
          let mine = 0;
          const area = this.traverseBoard(data[i][j].x, data[i][j].y, data);
          area.map(value => {
            if (value.isMine) {
              mine++;
            }
          });
          if (mine === 0) {
            updatedData[i][j].isEmpty = true;
          }
          updatedData[i][j].neighbour = mine;
        }
      }
    }

    return (updatedData);
  }

  traverseBoard(x, y, data) {
    const neighbourArr = [];

    // up
    if (x > 0) {
      neighbourArr.push(data[x - 1][y]);
    }

    // down
    if (x < this.props.height - 1) {
      neighbourArr.push(data[x + 1][y]);
    }

    // left
    if (y > 0) {
      neighbourArr.push(data[x][y-1]);
    }

    // right
    if (y < this.props.width - 1) {
      neighbourArr.push(data[x][y + 1]);
    }

    // top left
    if (x > 0 && y > 0) {
      neighbourArr.push(data[x - 1][y - 1]);
    }

    // top right
    if (x > 0 && y < this.props.width - 1) {
      neighbourArr.push(data[x - 1][y + 1]);
    }

    // bottom right
    if (x < this.props.height - 1 && y < this.props.width - 1) {
      neighbourArr.push(data[x + 1][y + 1]);
    }

    // bottom left
    if (x < this.props.height - 1 && y > 0) {
      neighbourArr.push(data[x + 1][y - 1]);
    }

    return neighbourArr;
  }

  revealBoard() {
    let updatedData = this.state.boardData;
    updatedData.map((dataRow) => {
      dataRow.map((dataItem) => {
        dataItem.isRevealed = true;
      });
    });
    this.setState({
      boardData: updatedData
    });
  }

  revealEmpty(x, y, data) {
    let area = this.traverseBoard(x, y, data);
    area.map(value => {
      if (!value.isRevealed && (value.isEmpty || !value.isMine)) {
        data[value.x][value.y].isRevealed = true;
        if (value.isEmpty) {
          this.revealEmpty(value.x, value.y, data);
        }
      }
    });

    return data;
  }

  handleSquareClick(x, y) {
    let didWin = false;

    if (this.state.boardData[x][y].isRevealed) return null;

    if (this.state.boardData[x][y].isMine) {
      this.revealBoard();
      alert("You Died 💀");
    }

    let updatedData = this.state.boardData;
    updatedData[x][y].isFlagged = false;
    updatedData[x][y].isRevealed = true;

    if (updatedData[x][y].isEmpty) {
      updatedData = this.revealEmpty(x, y, updatedData);
    }

    if (this.getHiddenSquares(updatedData).length === this.props.mines) {
      didWin = true;
      this.revealBoard();
      alert("Well Met! 🏆");
    }

    this.setState({
      boardData: updatedData,
      mineCount: this.props.mines - this.getFlags(updatedData).length,
      hasWon: didWin
    });
  }

  _handleContextMenu(e, x, y) {
    e.preventDefault();
    let updatedData = this.state.boardData;
    let mines = this.state.mineCount;
    let didWin = false;

    if (updatedData[x][y].isRevealed) return;

    if (updatedData[x][y].isFlagged) {
      updatedData[x][y].isFlagged = false;
      mines++;
    } else {
      updatedData[x][y].isFlagged = true;
      mines--;
    }

    if (mines === 0) {
      const mineArray = this.getMines(updatedData);
      const flagArray = this.getFlags(updatedData);
      didWin = (JSON.stringify(mineArray) === JSON.stringify(flagArray));

      if (didWin) {
        this.revealBoard();
        alert("Well Met! 🏆");
      }
    }

    this.setState({
      boardData: updatedData,
      mineCount: mines,
      gameWon: didWin,
    });
  }

  renderBoard(data) {
    return data.map((dataRow) => {
      return dataRow.map((dataItem) => {
        return (
          <div key={dataItem.x * dataRow.length + dataItem.y}>
            <Square
              onClick={() => this.handleSquareClick(dataItem.x, dataItem.y)}
              cMenu={(e) => this._handleContextMenu(e, dataItem.x, dataItem.y)}
              value={dataItem}
            />
            {(dataRow[dataRow.length - 1] === dataItem) ? <div className="clear" /> : ""}
          </div>
        )
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
      this.setState({
        boardData: this.initBoardData(nextProps.height, nextProps.width, nextProps.mines),
        gameWon: false,
        mineCount: nextProps.mines,
      });
    }
  }

  render() {
    return (
      <div className="board">
        <div className="game-info">
          <span>Mines left: {this.state.mineCount}</span><br />
          <span>{this.state.gameWom ? "Well Met 🏆" : ""}</span>
        </div>
        {this.renderBoard(this.state.boardData)}
        </div>
    )
  }
}

export default Board;