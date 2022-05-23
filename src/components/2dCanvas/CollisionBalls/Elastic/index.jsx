import Canvas from "../../../Canvas";
import Vec2 from "vec2";
import { useEffect, useState } from "react";

class Ball {
  acceleration = Vec2(0, 0);
  constructor(x, y, size, color) {
    this.positionOld = Vec2(x, y);
    this.positionCurrent = Vec2(x, y);
    this.size = size;
    this.color = color;
  }
}

export default function ElasticCollisionBalls() {
  const [balls, setBalls] = useState([]);
  const [ballsQuantity, setBallsQuantity] = useState(20);
  const [ballsSize, setBallsSize] = useState(10);
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const gravity = Vec2(0, 0.001);
  useEffect(() => {
    function init() {
      const ballsArray = [];
      for (let i = 0; i < ballsQuantity; i++) {
        const color = `hsl(${Math.round(Math.random() * 360)}, 100%, 50%)`;
        ballsArray.push(
          new Ball(
            ballsSize + Math.random() * (width - ballsSize * 2),
            ballsSize + Math.random() * (height - ballsSize * 2),
            // ballsSize +
            //   (Math.random() * (height - ballsSize * 2)) / 2 +
            //   (height - ballsSize * 2) / 2,
            Math.random() * 2 * ballsSize + 10,
            color
          )
        );
      }
      setBalls(ballsArray);
    }
    init();
  }, []);

  let lastTime = 0;
  function frame(ctx, ms) {
    // for (const ball of balls) {
    //   ball.size += 2 - Math.random() * 4.1;
    //   if (ball.size < 0) ball.size = 0;
    // }
    const dt = ms - lastTime;
    const subSteps = 8;
    const subDt = dt / subSteps;
    for (let step = 0; step < subSteps; step++) {
      applyGravity();
      applyConstraint();
      solveCollisions();
      applyUpdatePositions(subDt);
    }
    applyDraw(ctx);
    lastTime = ms;
  }

  function updatePositions(ball, dt) {
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
  function applyUpdatePositions(dt) {
    for (const ball of balls) {
      updatePositions(ball, dt);
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
        const vel = ball.positionCurrent.subtract(ball.positionOld, true);
        ball.positionCurrent = Vec2(ball.positionCurrent.x, height - ball.size);
        vel.x = -vel.x;
        ball.positionOld = ball.positionCurrent.add(vel, true);
      }
      if (ball.positionCurrent.y < ball.size) {
        const vel = ball.positionCurrent.subtract(ball.positionOld, true);
        ball.positionCurrent = Vec2(ball.positionCurrent.x, ball.size);
        vel.x = -vel.x;
        ball.positionOld = ball.positionCurrent.add(vel, true);
      }
      if (ball.positionCurrent.x > width - ball.size) {
        const vel = ball.positionCurrent.subtract(ball.positionOld, true);
        ball.positionCurrent = Vec2(width - ball.size, ball.positionCurrent.y);
        vel.y = -vel.y;
        ball.positionOld = ball.positionCurrent.add(vel, true);
      }
      if (ball.positionCurrent.x < ball.size) {
        const vel = ball.positionCurrent.subtract(ball.positionOld, true);
        ball.positionCurrent = Vec2(ball.size, ball.positionCurrent.y);
        vel.y = -vel.y;
        ball.positionOld = ball.positionCurrent.add(vel, true);
      }
    }
  }
  function solveCollisions() {
    for (let i = 0; i < balls.length; i++) {
      const ball1 = balls[i];
      for (let k = i + 1; k < balls.length; k++) {
        const ball2 = balls[k];
        const norm = ball1.positionCurrent.subtract(
          ball2.positionCurrent,
          true
        );
        const dist = norm.length();
        if (dist < ball1.size + ball2.size) {
          const unitNorm = norm.divide(dist, true);
          const unitTang = Vec2(-unitNorm.y, unitNorm.x);
          const velBall1 = ball1.positionCurrent.subtract(
            ball1.positionOld,
            true
          );
          const velBall2 = ball2.positionCurrent.subtract(
            ball2.positionOld,
            true
          );
          const v1ni = unitNorm.dot(velBall1);
          const v1t = unitTang.dot(velBall1);
          const v2ni = unitNorm.dot(velBall2);
          const v2t = unitTang.dot(velBall2);
          const v1nf =
            (v1ni * (ball1.size - ball2.size) + 2 * ball2.size * v2ni) /
            (ball1.size + ball2.size);
          const v2nf =
            (v2ni * (ball2.size - ball1.size) + 2 * ball1.size * v1ni) /
            (ball2.size + ball1.size);
          const vectV1nf = unitNorm.multiply(v1nf, true);
          const vectV1t = unitTang.multiply(v1t, true);
          const vectV2nf = unitNorm.multiply(v2nf, true);
          const vectV2t = unitTang.multiply(v2t, true);
          const v1f = vectV1nf.add(vectV1t, true);
          const v2f = vectV2nf.add(vectV2t, true);
          const delta = ball1.size + ball2.size - dist;
          const proportion = ball1.size / (ball1.size + ball2.size);
          ball1.positionCurrent.add(
            unitNorm.multiply((1 - proportion) * delta, true)
          );
          ball1.positionOld = ball1.positionCurrent.add(v1f.negate(true), true);
          ball2.positionCurrent.subtract(
            unitNorm.multiply(proportion * delta, true)
          );
          ball2.positionOld = ball2.positionCurrent.add(v2f.negate(true), true);
        }
      }
    }
  }
  return <Canvas draw={frame} height={height} width={width} />;
}
