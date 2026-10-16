/* Presentation only: never draws randomness or changes the sample sequence. */
class DiceDisplay {
    constructor(container, mode) {
        this.container = container;
        this.mode = mode;
        this.values = [];
        this.animations = [];
        this.poses = [];
    }

    render(count, sides, values = []) {
        this.stopMotion();
        this.sides = sides;
        this.container.dataset.display = this.mode;
        this.container.replaceChildren();
        this.poses = [];
        const pipPositions = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
        for (let i = 0; i < count; i++) {
            const die = document.createElement('div');
            die.className = this.mode === '3d' ? 'die die-3d' : 'die';
            die.setAttribute('role', 'img');
            die.style.setProperty('--die-accent', i === 0 ? '#c34f3d' : i === 1 ? '#2872ae' : 'var(--lab-teal-dark)');
            if (this.mode === '3d') {
                const lift = document.createElement('div');
                lift.className = 'die-lift';
                lift.setAttribute('aria-hidden', 'true');
                lift.innerHTML = '<div class="die-view"><div class="die-cube"></div></div>';
                const cube = lift.querySelector('.die-cube');
                for (let face = 1; face <= 6; face++) {
                    const surface = document.createElement('div');
                    surface.className = `die-face face-${face}`;
                    if (sides === 6) {
                        for (let cell = 1; cell <= 9; cell++) {
                            const pip = document.createElement('span');
                            pip.className = pipPositions[face].includes(cell) ? 'pip filled' : 'pip';
                            surface.append(pip);
                        }
                    } else {
                        surface.classList.add('numbered-face');
                    }
                    cube.append(surface);
                }
                const label = document.createElement('span');
                label.className = 'die-caption';
                label.setAttribute('aria-hidden', 'true');
                die.append(lift, label);
            } else {
                die.style.borderColor = i === 0 ? '#ef4444' : i === 1 ? '#3b82f6' : 'var(--lab-line)';
            }
            this.container.append(die);
        }
        this.settle(values);
    }

    pose(value) {
        if (this.sides !== 6) return [0, 0];
        return ({ 1: [0, 0], 2: [-90, 0], 3: [0, -90], 4: [0, 90], 5: [90, 0], 6: [0, 180] })[value] || [0, 0];
    }

    transform(pose) { return `rotateX(${pose[0]}deg) rotateY(${pose[1]}deg)`; }

    roll(values, duration) {
        this.stopMotion();
        this.container.setAttribute('aria-busy', 'true');
        [...this.container.children].forEach((die, i) => {
            die.setAttribute('aria-label', `Die ${i + 1}: rolling`);
            die.classList.add('is-rolling');
            if (this.mode !== '3d') return;
            die.querySelector('.die-caption').textContent = `Die ${i + 1} · Rolling`;
            if (this.sides !== 6) {
                die.querySelectorAll('.die-face').forEach(face => { face.textContent = values[i]; });
            }
            const cube = die.querySelector('.die-cube');
            const target = this.pose(values[i]);
            const turns = duration >= 300 ? 360 : 0;
            const direction = i % 2 ? -1 : 1;
            const end = [target[0] + turns, target[1] + turns * direction];
            const start = this.poses[i] || [0, 0];
            cube.style.transform = this.transform(target);
            if (!duration || !cube.animate) return;
            this.animations.push(cube.animate([
                { transform: this.transform(start) },
                { transform: this.transform(end) }
            ], { duration, easing: 'cubic-bezier(.16,.65,.25,1)', fill: 'forwards' }));
            this.animations.push(die.querySelector('.die-lift').animate([
                { transform: 'translateY(0) rotateZ(0deg)' },
                { transform: `translateY(-14px) rotateZ(${direction * 8}deg)`, offset: .32 },
                { transform: 'translateY(0) rotateZ(0deg)' }
            ], { duration, easing: 'cubic-bezier(.2,.65,.3,1)' }));
        });
    }

    settle(values) {
        this.stopMotion();
        this.values = [...values];
        this.container.setAttribute('aria-busy', 'false');
        [...this.container.children].forEach((die, i) => {
            const value = values[i];
            die.classList.remove('is-rolling');
            die.dataset.value = value ?? '';
            die.setAttribute('aria-label', `Die ${i + 1}: ${value ?? 'ready to roll'}`);
            if (this.mode === '3d') {
                this.poses[i] = this.pose(value);
                die.querySelector('.die-cube').style.transform = this.transform(this.poses[i]);
                die.querySelector('.die-caption').textContent = `Die ${i + 1} · ${value ?? 'Ready'}`;
                if (this.sides !== 6) die.querySelectorAll('.die-face').forEach(face => { face.textContent = value ?? '?'; });
            } else {
                die.textContent = value ?? '?';
            }
        });
    }

    pause() { this.animations.forEach(animation => animation.pause()); }
    resume() { this.animations.forEach(animation => animation.play()); }
    stopMotion() {
        this.animations.forEach(animation => animation.cancel());
        this.animations = [];
    }
}
