import { useState, useEffect, useRef } from 'react';
import './App.css';

const BOARD_DIMENSIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const DEFAULT_SNAKE_WIDTH: [number, number][] = [
  [2, 5],
  [1, 5],
  [0, 5],
];
export const App = () => {
  // Use React state to track the current position of the snake on the game board
  const [snakePosition, setSnakePosition] =
    useState<[number, number][]>(DEFAULT_SNAKE_WIDTH);

  // Use React state to track the current direction of the snake
  const [snakeDirection, setSnakeDirection] = useState<
    'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  >('RIGHT');

  // Use React state to track the position of the food on the game board
  const [foodPosition, setFoodPosition] = useState<[number, number]>([5, 5]);

  // Use React state to track whether the game is over
  const [gameOver, setGameOver] = useState(false);

  // Use React state to track the current score
  const [score, setScore] = useState(0);

  const boardRef = useRef<HTMLTableElement>(null);

  // Handle user input to update the direction of the snake
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Update the direction of the snake based on the key that was pressed
    if (event.key === 'ArrowUp' && snakeDirection !== 'DOWN') {
      setSnakeDirection('UP');
    } else if (event.key === 'ArrowDown' && snakeDirection !== 'UP') {
      setSnakeDirection('DOWN');
    } else if (event.key === 'ArrowLeft' && snakeDirection !== 'RIGHT') {
      setSnakeDirection('LEFT');
    } else if (event.key === 'ArrowRight' && snakeDirection !== 'LEFT') {
      setSnakeDirection('RIGHT');
    }
  };

  // Move the snake on the game board
  const moveSnake = () => {
    // Calculate the new position of the snake based on its current position and direction
    const newPosition = [...snakePosition];
    const currentHead = newPosition[0];
    if (snakeDirection === 'UP') {
      newPosition.unshift([currentHead[0], currentHead[1] - 1]);
    } else if (snakeDirection === 'DOWN') {
      newPosition.unshift([currentHead[0], currentHead[1] + 1]);
    } else if (snakeDirection === 'LEFT') {
      newPosition.unshift([currentHead[0] - 1, currentHead[1]]);
    } else if (snakeDirection === 'RIGHT') {
      newPosition.unshift([currentHead[0] + 1, currentHead[1]]);
    }

    if (!hasSnakeEatenFood()) {
      newPosition.pop();
    }

    // Update the position of the snake in the React state
    setSnakePosition(newPosition);

    // Check if the snake has hit the edge of the game board or collided with itself
    if (hasSnakeHitWall() || hasSnakeHitItself()) {
      // End the game if the snake has hit a wall or itself
      endGame();
      return;
    }

    // Check if the snake has eaten a piece of food
    if (hasSnakeEatenFood()) {
      // Grow the snake if it has eaten a piece of food
      growSnake();

      // Generate a new piece of food on the game board
      generateFood();

      // Increment the score
      setScore(score + 1);
    }
  };

  // Check if the snake has hit the edge of the game board
  const hasSnakeHitWall = () => {
    const currentHead = snakePosition[0];
    return (
      currentHead[0] < 0 ||
      currentHead[0] >= 10 ||
      currentHead[1] < 0 ||
      currentHead[1] >= 10
    );
  };

  // Check if the snake has collided with itself
  const hasSnakeHitItself = () => {
    const snakeBody = snakePosition.slice(1);
    console.log(
      snakeBody.some(
        (position) =>
          position[0] === snakePosition[0][0] &&
          position[1] === snakePosition[0][1]
      )
    );
    return snakeBody.some(
      (position) =>
        position[0] === snakePosition[0][0] &&
        position[1] === snakePosition[0][1]
    );
  };

  // Reset the game
  const resetGame = () => {
    setSnakePosition(DEFAULT_SNAKE_WIDTH);
    setSnakeDirection('RIGHT');
    setFoodPosition([5, 5]);
    setGameOver(false);
    setScore(0);
    boardRef.current && boardRef.current.focus();
  };

  // Check if the snake has eaten a piece of food
  const hasSnakeEatenFood = () => {
    return (
      snakePosition[0][0] === foodPosition[0] &&
      snakePosition[0][1] === foodPosition[1]
    );
  };

  // Grow the snake by adding a new cell to its tail
  const growSnake = () => {
    if (!hasSnakeEatenFood()) return;

    // Calculate the new position of the tail of the snake
    const currentTail = snakePosition[snakePosition.length - 1];
    const newTailPosition = [currentTail[0], currentTail[1]];

    // Update the position of the tail based on its current direction
    if (currentTail[0] < snakePosition[snakePosition.length - 2][0]) {
      newTailPosition[0] -= 1;
    } else if (currentTail[0] > snakePosition[snakePosition.length - 2][0]) {
      newTailPosition[0] += 1;
    } else if (currentTail[1] < snakePosition[snakePosition.length - 2][1]) {
      newTailPosition[1] -= 1;
    } else if (currentTail[1] > snakePosition[snakePosition.length - 2][1]) {
      newTailPosition[1] += 1;
    }

    // Add the new tail position to the snakePosition array
    const newSnakePosition: [number, number][] = [
      ...snakePosition,
      [newTailPosition[0], newTailPosition[1]],
    ];
    setSnakePosition(newSnakePosition);
  };

  // Generate a new piece of food on the game board
  const generateFood = () => {
    // Generate a random x and y coordinate for the food
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);

    // Update the position of the food in the React state
    setFoodPosition([x, y]);
  };

  // End the game
  const endGame = () => {
    // Update the gameOver state
    setGameOver(true);
  };

  // Use the useEffect hook to move the snake on the game board
  useEffect(() => {
    // Move the snake every 100ms
    const interval = setInterval(() => {
      if (!gameOver) {
        moveSnake();
      }
    }, 100);

    if (gameOver) {
      clearInterval(interval);
    }

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snakePosition, snakeDirection]);

  return (
    <div className='app'>
      {/* Render the game board */}
      <table onKeyDown={(e) => handleKeyDown(e)} tabIndex={1} ref={boardRef}>
        <tbody>
          {BOARD_DIMENSIONS.map((row) => (
            <tr key={row}>
              {BOARD_DIMENSIONS.map((column) => (
                <td
                  key={column}
                  style={{
                    width: '50px',
                    height: '50px',
                    padding: '0',
                  }}
                >
                  {/* Render the snake on the game board */}
                  {snakePosition.some(
                    ([x, y]) => x === column && y === row
                  ) && <div className='snake cube' />}

                  {/* Render the food on the game board */}
                  {!hasSnakeEatenFood() &&
                    foodPosition[0] === column &&
                    foodPosition[1] === row && <div className='food cube' />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Render the game over screen */}
      {gameOver && (
        <div className='game-over'>
          <p>Game over! Your score was {score}.</p>
          <button onClick={resetGame}>Play again</button>
        </div>
      )}
    </div>
  );
};

export default App;
