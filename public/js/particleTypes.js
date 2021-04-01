'use strict';

const particleTypes = {
    star: {
        id: "star",
        /*
        animations: {
            idle: [
                { frame: "frame-1", s: 3 },
            ],
        },
        frames: {
            "frame-1": [
                { path: "star" },
            ],
        },        
        paths: {
            star: {
                fill: "#ffffff",
                stroke: "#303030",
                commands: [{ c: "rc", l: 0.0, t: 0.0, r: 1.0, b: 1.0 }]
            },
        },*/
        create({ x, y }) {
            let size = 2 + Math.random() * 10;
            return new Particle({
                type: this,
                x,
                y,
                width: size,
                height: size,
                duration: 0.2 + Math.random() / 4,
                rotation: (Math.random() - Math.random()) / 2,
                weight: 0.1,//Math.random()/5,
                velocity: {
                    x: (Math.random() - Math.random()) * 8.5,
                    y: (Math.random() - Math.random()) * 8.5
                }
            });
        },
        move(particle) {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.x /= 1.08;
            particle.velocity.y /= 1.08;
            //particle.velocity.y /= 1.1;
            //particle.velocity.y += particle.weight;
        },
        draw(particle, context, fill = true, stroke = true) {
            let time = (Date.now() - particle.startTime) / particle.duration;
            let easing = easePop(time) * 2;
            //context.lineWidth = 1.5;
            context.fillStyle = "#ffff80";
            context.strokeStyle = '#f08030';//"#383838";
            context.lineWidth = 3.5;
            //console.log(easing);

            const top = -easing,
                right = particle.width + easing,
                bottom = particle.height + easing,
                left = -easing;

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

            //context.stroke();
            //}

            if (fill) {
                context.fill();
            }
            if (stroke) {
                context.stroke();
            }
            //context.fill();
            //context.stroke();
            context.translate(right / 2, bottom / 2);
            context.rotate(Math.PI * 2 * -time * particle.rotation);
            context.translate(-right / 2, -bottom / 2);
        }
    },
    dust: {
        id: "dust",
        create({ x, y, energy, velocity = { x: 0, y: 0 } }) {
            let size = 0.1 + Math.random() * 7;//5;
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
                    y: 0 + velocity.y
                }
            });
        },
        move(particle) {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.x /= 1.08;
            //particle.velocity.y /= 1.1;
            particle.velocity.y -= particle.weight / 2;
            particle.weight /= 1.05;
            //particle.velocity.y = Math.max(particle.velocity.y,-3);
        },
        draw(particle, context, fill = true, stroke = true) {
            //if (stroke) {
            //    return;
            //}
            let time = (Date.now() - particle.startTime) / particle.duration;
            let easing = easePop(time);
            //context.lineWidth = 1.5;
            //context.fillStyle = "#989898";
            context.fillStyle = "#b0b0b0";
            //context.strokeStyle = "#484848";
            context.strokeStyle = "#585858";
            context.lineWidth = 3.5;
            //context.strokeStyle = "#383838";
            //console.log(easing);

            const top = -particle.width / 2 - easing,
                right = particle.width / 2 + easing,
                bottom = particle.height / 2 + easing,
                left = -particle.height / 2 - easing;

            //context.fillStyle = "#808080";
            context.beginPath();
            context.arc(
                right / 2,
                bottom / 2,
                (right - left) / 2,
                0,
                Math.PI * 2);

            if (fill) {
                context.fill();
            }
            if (stroke) {
                context.stroke();
            }
        }
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
                }
            });
        },
        move(particle) {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.x /= 1.08;
            particle.velocity.y /= 1.08;
            //particle.velocity.y /= 1.1;
            //particle.velocity.y += particle.weight;
            //particle.weight /= 1.05;
            //particle.velocity.y = Math.max(particle.velocity.y,-3);
        },
        draw(particle, context, fill = true, stroke = true) {
            if (fill) {
                context.lineWidth = 2;
                context.lineCap = "round";
                context.strokeStyle = "#e0e060";
                //return;
            }
            else {
                context.lineWidth = 6.5;
                context.lineCap = "round";
                context.strokeStyle = "#ff7838";
                //context.strokeStyle = "#e0e060";
            }

            context.beginPath();
            context.moveTo(-particle.velocity.x * 2, -particle.velocity.y * 2);
            context.lineTo(particle.velocity.x * 4, particle.velocity.y * 4);
            context.stroke();
        }
    },
    crumb: {
        id: "crumb",
        create({ x, y, energy = 1, velocity = { x: 0, y: 0 } }) {
            let size = 1 + Math.random() * 7;//5;
            return new Particle({
                type: this,
                x,
                y,
                width: size,
                height: size,
                duration: 1 + Math.random() / 4,
                rotation: (Math.random() - Math.random()) / 2,
                weight: 0.1 + Math.random() / 10,
                velocity: {
                    x: (Math.random() - Math.random()) * 4 * energy + velocity.x,
                    y: -Math.random() * 4 * energy + velocity.y,
                }
            });
        },
        move(particle) {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.x /= 1.03;
            //particle.velocity.y /= 1.08;
            //particle.velocity.y /= 1.1;
            particle.velocity.y += particle.weight;
            //particle.weight /= 1.05;
            //particle.velocity.y = Math.max(particle.velocity.y,-3);
        },
        draw(particle, context, fill = true, stroke = true) {

            let time = (Date.now() - particle.startTime) / particle.duration;
            context.fillStyle = "#ffffff";
            context.strokeStyle = "#404040";
            context.lineWidth = 3;

            const top = -particle.width / 2,
                right = particle.width / 2,
                bottom = particle.height / 2,
                left = -particle.height / 2;

            context.rotate(Math.PI * 2 * time * 10 * particle.rotation);
            context.beginPath();
            /*
            context.arc(
                right / 2,
                bottom / 2,
                (right - left) / 2,
                0,
                Math.PI * 2);
                */
            context.rect(left, top, right, bottom);
            if (fill) {
                context.fill();
            }
            if (stroke) {
                context.stroke();
            }
            context.rotate(Math.PI * 2 * time * 10 * -particle.rotation);
        }
    },
    fire: {
        id: "fire",
        create({ x, y, energy, velocity = { x: 0, y: 0 } }) {
            let size = 1;//1 + Math.random() * 8;
            return new Particle({
                type: this,
                x: x + (Math.random() - Math.random()) * 8 + velocity.x * 12,
                y: y + (Math.random() - Math.random()) * 8 + velocity.y * 12,
                width: size,
                height: size,
                duration: 0.5 + Math.random()/2,
                rotation: Math.random() * Math.PI * 2,
                weight: -Math.random() / 50,
                velocity
            });
        },
        move(particle) {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.x /= 1.01;
            //particle.velocity.y /= 1.1;
            particle.velocity.y += particle.weight;
            //particle.weight /= 1.01;
            particle.rotation += 0.15;
            //particle.velocity.y = Math.max(particle.velocity.y,-3);
        },
        draw(particle, context, fill = true, stroke = true) {

            if (stroke) {
                let time = (Date.now() - particle.startTime) / particle.duration;
                let easing = easeFire(time) * 12;
                context.lineWidth = 3.5;
                
                if (time < 0.05) {
                    context.fillStyle = "#ffffff";
                    context.strokeStyle = "#ffe000";
                }
                else if (time < 0.1) {
                    context.fillStyle = "#ffe000";
                    context.strokeStyle = "#ffe000";
                }                
                else if (time < 0.5) {
                    context.fillStyle = "#ff0000";
                    context.strokeStyle = "#ffe000";
                }
                else if (time < 0.7) {
                    context.fillStyle = "#a02020";
                    context.strokeStyle = "#ff0000";
                }
                else {
                    context.fillStyle = "#505050";
                    context.strokeStyle = "#8f0000";
                }
                /*
                if (time < 0.05) {
                    context.fillStyle = "#ffffff";
                    context.strokeStyle = "#ffe000";
                }
                else if (time < 0.1) {
                    context.fillStyle = "#ffe000";
                    context.strokeStyle = "#ffe000";
                }                
                else if (time < 0.2) {
                    context.fillStyle = "#ff0000";
                    context.strokeStyle = "#ffe000";
                }
                else if (time < 0.5) {
                    context.fillStyle = "#a02020";
                    context.strokeStyle = "#ff0000";
                }
                else {
                    context.fillStyle = "#505050";
                    context.strokeStyle = "#8f0000";
                }    
                */            
                //context.strokeStyle = "#ff0000";
                //context.lineWidth = 10;

                const top = -particle.width / 2 - easing,
                    right = particle.width / 2 + easing,
                    bottom = particle.height / 2 + easing,
                    left = -particle.height / 2 - easing;

                //context.fillStyle = "#808080";
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

            /*
            if (fill) {
                let time = (Date.now() - particle.startTime) / particle.duration;
                let easing = easeFire(time*2) * 2;
                //if (time < 0.12) {
                //    context.fillStyle = "#ffffff";
                //}
                if (time < 0.2) {
                    context.fillStyle = "#ffe000";
                }
                //else if (time < 0.7) {
                //    context.fillStyle = "#ff0000";
                //}
                else {
                    return;
                }
                //context.strokeStyle = "#ff0000";
                //context.lineWidth = 10;

                const top = -particle.width / 2 - easing,
                    right = particle.width / 2 + easing,
                    bottom = particle.height / 2 + easing,
                    left = -particle.height / 2 - easing;

                //context.fillStyle = "#808080";
                context.rotate(-particle.rotation / 2);
                context.beginPath();
                context.rect(
                    left,
                    top,
                    right - left,
                    bottom - top
                );
                context.fill();
                context.rotate(particle.rotation / 2);
            }*/

        }
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
                }
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
 
            const top = -particle.width / 2,
                right = particle.width / 2,
                bottom = particle.height / 2,
                left = -particle.height / 2;

            context.beginPath();
            context.moveTo(right/2, top);
            context.quadraticCurveTo(right, bottom*0.9, right/2, bottom);
            context.quadraticCurveTo(left, bottom*0.9, right/2, top);

            context.fill();
            context.stroke();
        }
    },
}