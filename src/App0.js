import { useState } from 'react'
import './App.css'

const App = () => {

  const [board, setBoard] = useState([
    [0,0,0],
    [0,0,0],
    [0,0,0]
  ])

  const [player, setPlayer] = useState(1)

  return(
    <div>
      <Board
        board={board}
        setBoard={setBoard}
        player={player}
        setPlayer={setPlayer}/>
    </div>
  )

}

const Board = ({ board, setBoard, player, setPlayer }) => {

  const symbol = (n) => {
    if(n === 1) return 'X'
    if(n === 2) return 'O'
    return '-'
  }

  const handleClick = (i0, j0) => {
    if(board[i0][j0] > 0) return
    const newBoard = board.map((row, i) => row.map((n, j) =>
      (i === i0) && (j === j0) ? player : board[i][j]
    ))
    setBoard(newBoard)
    setPlayer(player % 2 + 1)
  }

  return(
    <table>
      <tbody>
        {board.map((row, i) => (
          <tr key={i}>
            {row.map((n, j) => <td
              key={10*(i + 1) + j}
              onClick={() => handleClick(i, j)}>{symbol(n)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default App
