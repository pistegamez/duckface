/* eslint-disable no-undef */
"use strict";

// eslint-disable-next-line no-unused-vars
const particleTypes = {
  star: {
    id: "star",
    create({ x, y }) {
      const size = 2 + Math.random() * 10;
      return new Particle({
        type: this,
        x,
        y,
        width: size,
        height: size,
        duration: 0.2 + Math.random() / 4,
        rotation: (Math.random() - Math.random()) / 2,
        weight: 0.1,
        velocity: {
          x: (Math.random() - Math.random()) * 8.5,
          y: (Math.random() - Math.random()) * 8.5,
        },
      });
    },
    move(particle) {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x /= 1.08;
      particle.velocity.y /= 1.08;
      // particle.velocity.y /= 1.1;
      // particle.velocity.y += particle.weight;
    },
    draw(particle, context, fill = true, stroke = true) {
      const time = (Date.now() - particle.startTime) / particle.duration;
      const easing = easePop(time) * 2;
      // context.lineWidth = 1.5;
      context.fillStyle = "#ffff80";
      context.strokeStyle = "#f08030"; // "#383838";
      context.lineWidth = 3.5;
      // console.log(easing);

      const top = -easing;
      const right = particle.width + easing;
      const bottom = particle.height + easing;
      const left = -easing;

      context.translate(right / 2, bottom / 2);
      context.rotate(Math.PI * 2 * time * particle.rotation);
      context.translate(-right / 2, -bottom / 2);

      context.beginPath();
      context.moveTo(left, bottom);
      context.lineTo(right / 2, top);
      context.lineTo(right, bottom);
      context.lineTo(left, bottom / 2);
      context.lineTo(right, bottom / 2);
      context.closePath();

      if (fill) {
        context.fill();
      }
      if (stroke) {
        context.stroke();
      }

      context.translate(right / 2, bottom / 2);
      context.rotate(Math.PI * 2 * -time * particle.rotation);
      context.translate(-right / 2, -bottom / 2);
    },
  },
  dust: {
    id: "dust",
    create({ x, y, energy, velocity = { x: 0, y: 0 } }) {
      const size = 0.1 + Math.random() * 7;
      return new Particle({
        type: this,
        x: x + (Math.random() - Math.random()) * 3,
        y,
        width: size,
        height: size,
        duration: 0.5 + Math.random() / 4,
        rotation: (Math.random() - Math.random()) / 2,
        weight: Math.random() / 10,
        velocity: {
          x: (Math.random() - Math.random()) * 8 * energy + velocity.x,
          y: 0 + velocity.y,
        },
      });
    },
    move(particle) {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x /= 1.08;
      particle.velocity.y -= particle.weight / 2;
      particle.weight /= 1.05;
    },
    draw(particle, context, fill = true, stroke = true) {
      const time = (Date.now() - particle.startTime) / particle.duration;
      const easing = easePop(time);
      context.fillStyle = "#b0b0b0";
      context.strokeStyle = "#585858";
      context.lineWidth = 3.5;

      const top = -particle.width / 2 - easing;
      const right = particle.width / 2 + easing;
      const bottom = particle.height / 2 + easing;
      const left = -particle.height / 2 - easing;

      context.beginPath();
      context.arc(right / 2, bottom / 2, (right - left) / 2, 0, Math.PI * 2);

      if (fill) {
        context.fill();
      }
      if (stroke) {
        context.stroke();
      }
    },
  },
  stroke: {
    id: "stroke",
    create({ x, y, energy = 1, velocity = { x: 0, y: 0 } }) {
      return new Particle({
        type: this,
        x,
        y,
        duration: 0.2 + Math.random() / 4,
        weight: Math.random() / 100,
        velocity: {
          x: (Math.random() - Math.random()) * 8 * energy + velocity.x,
          y: (Math.random() - Math.random()) * 8 * energy + velocity.y,
        },
      });
    },
    move(particle) {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x /= 1.08;
      particle.velocity.y /= 1.08;
      // particle.velocity.y /= 1.1;
      // particle.velocity.y += particle.weight;
      // particle.weight /= 1.05;
      // particle.velocity.y = Math.max(particle.velocity.y,-3);
    },
    draw(particle, context, fill = true, stroke = true) {
      if (fill) {
        context.lineWidth = 2;
        context.lineCap = "round";
        context.strokeStyle = "#e0e060";
        // return;
      } else {
        context.lineWidth = 6.5;
        context.lineCap = "round";
        context.strokeStyle = "#ff7838";
        // context.strokeStyle = "#e0e060";
      }

      context.beginPath();
      context.moveTo(-particle.velocity.x * 2, -particle.velocity.y * 2);
      context.lineTo(particle.velocity.x * 4, particle.velocity.y * 4);
      context.stroke();
    },
  },
  crumb: {
    id: "crumb",
    create({
      x,
      y,
      energy = 1,
      velocity = { x: 0, y: 0 },
      fill,
      stroke,
      maxSize = 5,
      minSize = 1,
    }) {
      const size = minSize + Math.random() * (maxSize - minSize);
      return new Particle({
        type: this,
        x,
        y,
        fill,
        stroke,
        width: size,
        height: size,
        duration: 1 + Math.random() / 4,
        rotation: (Math.random() - Math.random()) / 2,
        weight: 0.1 + Math.random() / 10,
        velocity: {
          x: (Math.random() - Math.random()) * 4 * energy + velocity.x,
          y: -Math.random() * 4 * energy + velocity.y,
        },
      });
    },
    move(particle) {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x /= 1.03;
      particle.velocity.y += particle.weight;
    },
    draw(particle, context, fill = true, stroke = true) {
      const time = (Date.now() - particle.startTime) / particle.duration;
      context.fillStyle = particle.fill;
      context.strokeStyle = particle.stroke;
      context.lineWidth = 3;

      const top = -particle.width / 2;
      const right = particle.width / 2;
      const bottom = particle.height / 2;
      const left = -particle.height / 2;

      context.rotate(Math.PI * 2 * time * 10 * particle.rotation);
      context.beginPath();

      context.moveTo(left, top);
      context.lineTo(right, top);
      context.lineTo(right, bottom);
      context.lineTo(left, bottom);
      context.closePath();

      if (fill) {
        context.fill();
      }
      if (stroke) {
        context.stroke();
      }
      context.rotate(Math.PI * 2 * time * 10 * -particle.rotation);
    },
  },
  fire: {
    id: "fire",
    create({ x, y, energy, velocity = { x: 0, y: 0 } }) {
      const size = 1;
      return new Particle({
        type: this,
        x: x + (Math.random() - Math.random()) * 8 + velocity.x * 12,
        y: y + (Math.random() - Math.random()) * 8 + velocity.y * 12,
        width: size,
        height: size,
        duration: 0.5 + Math.random() / 2,
        rotation: Math.random() * Math.PI * 2,
        weight: -Math.random() / 50,
        velocity,
      });
    },
    move(particle) {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x /= 1.01;
      particle.velocity.y += particle.weight;
      particle.rotation += 0.15;
    },
    draw(particle, context, fill = true, stroke = true) {
      if (stroke) {
        const time = (Date.now() - particle.startTime) / particle.duration;
        const easing = easeFire(time) * 12;
        context.lineWidth = 3.5;

        if (time < 0.05) {
          context.fillStyle = "#ffffff";
          context.strokeStyle = "#ffe000";
        } else if (time < 0.1) {
          context.fillStyle = "#ffe000";
          context.strokeStyle = "#ffe000";
        } else if (time < 0.5) {
          context.fillStyle = "#ff0000";
          context.strokeStyle = "#ffe000";
        } else if (time < 0.7) {
          context.fillStyle = "#a02020";
          context.strokeStyle = "#ff0000";
        } else {
          context.fillStyle = "#505050";
          context.strokeStyle = "#8f0000";
        }
        const top = -particle.width / 2 - easing;
        const right = particle.width / 2 + easing;
        const bottom = particle.height / 2 + easing;
        const left = -particle.height / 2 - easing;

        randoms.save();
        context.rotate(particle.rotation);
        context.beginPath();
        context.moveTo(left + randoms.nextValue, top + randoms.nextValue);
        context.lineTo(right + randoms.nextValue, top + randoms.nextValue);
        context.lineTo(right + randoms.nextValue, bottom + randoms.nextValue);
        context.lineTo(left + randoms.nextValue, bottom + randoms.nextValue);
        context.closePath();
        randoms.restore();
        context.fill();
        context.stroke();
        context.rotate(-particle.rotation);
      }
    },
  },
  drop: {
    id: "drop",
    create({ x, y, energy, velocity = { x: 0, y: 0 } }) {
      return new Particle({
        type: this,
        x: x + (Math.random() - Math.random()) * 3,
        y: y + (Math.random() - Math.random()) * 3,
        width: 8,
        height: 16,
        duration: 1,
        rotation: 0,
        weight: 0.1 + Math.random() / 10,
        velocity: {
          x: 0,
          y: 0,
        },
      });
    },
    move(particle) {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x /= 1.1;
      particle.velocity.y += particle.weight / 2;
    },
    draw(particle, context, fill = true, stroke = true) {
      if (stroke) {
        return;
      }

      context.fillStyle = "#d0d0f0";
      context.strokeStyle = "#585858";
      context.lineWidth = 1.5;

      const top = -particle.width / 2;
      const right = particle.width / 2;
      const bottom = particle.height / 2;
      const left = -particle.height / 2;

      context.beginPath();
      context.moveTo(right / 2, top);
      context.quadraticCurveTo(right, bottom * 0.9, right / 2, bottom);
      context.quadraticCurveTo(left, bottom * 0.9, right / 2, top);

      context.fill();
      context.stroke();
    },
  },
};
