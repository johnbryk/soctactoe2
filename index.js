// this one checks wins and updates, doesn't check stalemate

// set up server
const express = require('express')
const app = express()
app.use(express.static('public'))

const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

// set up state
const newBoard = [ [0,0,0], [0,0,0], [0,0,0] ]
let board = newBoard.map(row => row.slice())
let turn = 1
let queue = []
let players = []

// on connect
io.on('connection', (socket) => {
  const user = socket.id
  io.to(user).emit('update', board, turn)

  // put in players or queue
  if(players.length < 2) {
    players = players.concat(user)
    io.to(user).emit('playing', players.length)

    // check if start game
    if(players.length == 2) {
      io.emit('ready')
    }
  } else {
    queue = queue.concat(user)
    io.to(user).emit('ready')
  }
  
  // on disconnect
  socket.on('disconnect', () => {
    queue = queue.filter(queuer => queuer !== user)
    players = players.filter(player => player !== user)

    // if was player, reset game
    if(players.length <= 1) {
      board = newBoard.map(row => row.slice())
      turn = 1
      io.emit('reset')

      // check for new player
      if(queue.length > 0) {
        let first = queue[0]
        players = players.concat(first)
        queue = queue.filter(queuer => queuer !== first)
      } else {
        io.emit('unready')
      }
      
      // renumber players
      players.forEach((player, i) => io.to(player).emit('playing', i+1))
    }
  })

  // check win
  const checkRow = (i) => {
    return board[i][0] === board[i][1] && board[i][1] === board[i][2]
  }
  const checkCol = (j) => {
    return board[0][j] === board[1][j] && board[1][j] === board[2][j]
  }
  const checkMainDiag = () => {
    return board[0][0] === board[1][1] && board[1][1] === board[2][2]
  }
  const checkOffDiag = () => {
    return board[0][2] === board[1][1] && board[1][1] === board[2][0]
  }
  const checkWin = (i, j) => {
    if(checkRow(i)) return true
    if(checkCol(j)) return true
    if(i === j && checkMainDiag()) return true
    if(i === 2 - j && checkOffDiag()) return true
    return false
  }

  // check stalemate
  const checkStalemate = () => {
    for(let i = 0; i < 3; i++) {
      for(let j = 0; j < 3; j++) {
        if(board[i][j] === 0) return false
      }
    }
    return true
  }

  // move handler
  const onMove = (i, j) => {
    const player = players.indexOf(user)+1

    // if can move... move
    if(players.length == 2 && player === turn && board[i][j] === 0) {
      board[i][j] = turn
      turn = turn % 2 + 1

      // if win, update queue
      if(checkWin(i, j)) {
        const loser = players[turn - 1]
        const winner = players[player - 1]

        // update queue
        queue.push(loser)
        const newPlayer = queue.shift()
        io.to(loser).emit('playing', 0)

        // update players
        players = [winner]
        io.to(winner).emit('playing', 1)

        players.push(newPlayer)
        io.to(newPlayer).emit('playing', 2)

        // reset board
        board = newBoard.map(row => row.slice())
        turn = 1

        console.log(players)
        console.log(queue)
      } else if(checkStalemate()) {
        // update queue
        queue.push(...players)
        io.to(players[0]).emit('playing', 0)
        io.to(players[1]).emit('playing', 0)

        // update players
        players = [queue.shift()]
        io.to(players[0]).emit('playing', 1)

        players.push(queue.shift())
        io.to(players[1]).emit('playing', 2)

        // reset board
        board = newBoard.map(row => row.slice())
        turn = 1

        console.log(players)
        console.log(queue)
      }
    }

    // update everyone
    io.emit('update', board, turn)
  }

  // handling moves
  socket.on('move', onMove)
})

const PORT = process.env.PORT || 3000
server.listen(PORT)
