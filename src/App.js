import { useState } from 'react'
import './App.css'

import { io } from 'socket.io-client'
const socket = io(__dirname)

const symbol = (n) => {
  if(n === 1) return 'X'
  if(n === 2) return 'O'
  return '-'
}

const newBoard = [
  [0,0,0],
  [0,0,0],
  [0,0,0]
]

const logMove = (board, player, turn, ready, i, j) => {
  console.log(`board: ${board}\nplayer: ${player}\nturn: ${turn}\nready: ${ready}\nmove: (${i}, ${j})`)
}

const App = () => {

  const [board, setBoard] = useState(newBoard)
  const [player, setPlayer] = useState(0)
  const [turn, setTurn] = useState(1)
  const [ready, setReady] = useState(false)

  socket.on('reset', () => {
    setBoard(newBoard)
    setTurn(1)
  })
  socket.on('playing', (player) => { setPlayer(player) })
  socket.on('ready', () => { setReady(true) })
  socket.on('unready', () => { setReady(false) })
  socket.on('update', (board, turn) => {
    setBoard(board)
    setTurn(turn)
  })

  const whoseTurn = () => {
    if(player === turn) return 'your'
    return "opponent's"
  }

  const label = () => {
    if(player === 0) return 'Spectating'
    return (
      <span>
        {`You are ${symbol(player)}`} <br/> {ready ? `It is ${whoseTurn()} turn` : 'Waiting for another player...'}
      </span>
    )
  }

  return(
    <div>
      <Board
        board={board}
        player={player}
        turn={turn}
        ready={ready}/>
      <div className='label'>
        {label()}
      </div>
    </div>

  )

}

const Board = ({ board, player, turn, ready }) => {

  const handleClick = (i, j) => {
    logMove(board, player, turn, ready, i, j)
    socket.emit('move', i, j)
  }

  const drawBoard = () => {
    console.log(board)
    return (
      <table>
        <tbody>
          {board.map((row, i) => (
            <tr key={i}>
              {row.map((n, j) => <td key={10*(i + 1) + j} onClick={() => handleClick(i, j)}>{symbol(n)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return(
    drawBoard()
  )
}

export default App
