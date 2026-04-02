export const GET_GAME_STATE = `
  query GetGameState($roomCode: String!, $playerId: String!) {
    getGameState(roomCode: $roomCode, playerId: $playerId) {
      roomCode
      phase
      players {
        id
        name
        avatarId
        secretWords
        isEliminated
        eliminationReason
        isHost
        challengesRemaining
      }
      messages {
        type
        id
        text
        timestamp
        playerId
        playerName
        triggeredWord
      }
      currentPlayerId
      winnerId
      themeId
      themeLabel
    }
  }
`;

export const CREATE_ROOM = `
  mutation CreateRoom($playerId: String!, $playerName: String!, $avatarId: String) {
    createRoom(playerId: $playerId, playerName: $playerName, avatarId: $avatarId) {
      roomCode
      eventType
      timestamp
      error
    }
  }
`;

export const JOIN_ROOM = `
  mutation JoinRoom($roomCode: String!, $playerId: String!, $playerName: String!, $avatarId: String) {
    joinRoom(roomCode: $roomCode, playerId: $playerId, playerName: $playerName, avatarId: $avatarId) {
      roomCode
      eventType
      timestamp
      error
    }
  }
`;

export const SELECT_THEME = `
  mutation SelectTheme($roomCode: String!, $playerId: String!, $themeId: String!) {
    selectTheme(roomCode: $roomCode, playerId: $playerId, themeId: $themeId) {
      roomCode
      eventType
      timestamp
      error
    }
  }
`;

export const START_GAME = `
  mutation StartGame($roomCode: String!, $playerId: String!) {
    startGame(roomCode: $roomCode, playerId: $playerId) {
      roomCode
      eventType
      timestamp
      error
    }
  }
`;

export const SEND_MESSAGE = `
  mutation SendMessage($roomCode: String!, $playerId: String!, $text: String!) {
    sendMessage(roomCode: $roomCode, playerId: $playerId, text: $text) {
      roomCode
      eventType
      timestamp
      error
      message {
        type
        id
        text
        timestamp
        playerId
        playerName
        triggeredWord
      }
      elimination {
        playerId
        playerName
        reason
        word
      }
      gameOver {
        winnerId
        winnerName
      }
    }
  }
`;

export const CHALLENGE = `
  mutation Challenge($roomCode: String!, $playerId: String!, $guess: String!) {
    challenge(roomCode: $roomCode, playerId: $playerId, guess: $guess) {
      roomCode
      eventType
      timestamp
      error
      challenge {
        success
        guessedWord
        matchedWord
        penaltyPlayerId
        penaltyWord
      }
      gameOver {
        winnerId
        winnerName
      }
    }
  }
`;

export const RESTART_GAME = `
  mutation RestartGame($roomCode: String!, $playerId: String!) {
    restartGame(roomCode: $roomCode, playerId: $playerId) {
      roomCode
      eventType
      timestamp
      error
    }
  }
`;
