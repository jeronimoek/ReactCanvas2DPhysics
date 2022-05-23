import Canvas from "../../../Canvas";
import Vec2 from "vec2";
import { useEffect, useState } from "react";

class Ball {
  acceleration = Vec2(0, 0);
  constructor(x, y, size, color) {
    this.positionOld = Vec2(x - 1, y);
    this.positionCurrent = Vec2(x, y);
    this.size = size;
    this.color = color;
  }
}

export default function InelasticCollisionBalls() {
  const [balls, setBalls] = useState([]);
  const [ballsQuantity, setBallsQuantity] = useState(500);
  const [ballsSize, setBallsSize] = useState(20);
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const gravity = Vec2(0, 10);
  useEffect(() => {
    function init() {
      const ballsArray = [];
      for (let i = 0; i < ballsQuantity; i++) {
        const color = `hsl(${Math.round(Math.random() * 360)}, 100%, 50%)`;
        ballsArray.push(
          new Ball(
            ballsSize + Math.random() * (width - ballsSize * 2),
            ballsSize + Math.random() * (height - ballsSize * 2),
            Math.random() * 2 * ballsSize,
            color
          )
        );
      }
      setBalls(ballsArray);
    }
    init();
  }, []);

  function frame(ctx) {
    // for (const ball of balls) {
    //   ball.size += 2 - Math.random() * 4.1;
    //   if (ball.size < 0) ball.size = 0;
    // }
    applyGravity();
    applyConstraint();
    solveCollisions();
    applyUpdate();
    applyDraw(ctx);
  }

  function update(ball, dt = 0.1) {
    const vel = ball.positionCurrent.subtract(ball.positionOld, true);
    ball.positionOld = ball.positionCurrent.clone();
    ball.positionCurrent.add(
      vel.add(ball.acceleration.multiply(dt ** 2, true), true)
    );
    ball.acceleration = Vec2(0, 0);
  }

  function accelerate(ball, acc) {
    ball.acceleration.add(acc);
  }

  function applyDraw(ctx) {
    for (const ball of balls) {
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(
        ball.positionCurrent.x,
        ball.positionCurrent.y,
        ball.size,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.fill();
    }
  }
  function applyUpdate() {
    for (const ball of balls) {
      update(ball);
    }
  }
  function applyGravity() {
    for (const ball of balls) {
      accelerate(ball, gravity);
    }
  }
  function applyConstraint() {
    for (const ball of balls) {
      if (ball.positionCurrent.y > height - ball.size) {
        ball.positionCurrent = Vec2(ball.positionCurrent.x, height - ball.size);
      }
      if (ball.positionCurrent.y < ball.size) {
        ball.positionCurrent = Vec2(ball.positionCurrent.x, ball.size);
      }
      if (ball.positionCurrent.x > width - ball.size) {
        ball.positionCurrent = Vec2(width - ball.size, ball.positionCurrent.y);
      }
      if (ball.positionCurrent.x < ball.size) {
        ball.positionCurrent = Vec2(ball.size, ball.positionCurrent.y);
      }
    }
  }
  function solveCollisions() {
    for (let i = 0; i < balls.length; i++) {
      const ball1 = balls[i];
      for (let k = i + 1; k < balls.length; k++) {
        const ball2 = balls[k];
        const collisionAxis = ball1.positionCurrent.subtract(
          ball2.positionCurrent,
          true
        );
        const dist = collisionAxis.length();
        if (dist < ball1.size + ball2.size) {
          const n = collisionAxis.divide(dist, true);
          const delta = ball1.size + ball2.size - dist;
          ball1.positionCurrent.add(n.multiply(0.5 * delta, true));
          ball2.positionCurrent.subtract(n.multiply(0.5 * delta, true));
        }
      }
    }
  }

  const paintEvent = (clickPos) => {
    const color = `hsl(${Math.round(Math.random() * 360)}, 100%, 50%)`;
    for (const ball of balls) {
      if (ball.positionCurrent.distance(clickPos) < 300) {
        ball.color = color;
      }
    }
  };

  const liftEvent = (clickPos) => {
    for (const ball of balls) {
      if (ball.positionCurrent.distance(clickPos) < 300) {
        ball.positionOld = ball.positionCurrent.add(Vec2(0, 10), true);
      }
    }
  };

  const onClick = (e) => {
    const clickPos = Vec2(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    paintEvent(clickPos);
    liftEvent(clickPos);
  };

  return (
    <Canvas draw={frame} height={height} width={width} onClick={onClick} />
  );
}
