const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================
   HTML ELEMENTEN
========================= */

const scoreEl =
    document.getElementById("score");

const waveEl =
    document.getElementById("wave");

const healthFill =
    document.getElementById("healthFill");

const healthText =
    document.getElementById("healthText");

const weaponName =
    document.getElementById("weaponName");

const menu =
    document.getElementById("menu");

const game =
    document.getElementById("game");

const gameOver =
    document.getElementById("gameOver");

const pauseEl =
    document.getElementById("pause");


const W = canvas.width;
const H = canvas.height;


/* =========================
   GAME VARIABELEN
========================= */

let running = false;

let paused = false;

let score = 0;

let health = 100;

let wave = 1;

let kills = 0;

let waveKills = 0;

let last = 0;

let spawnTimer = 0;

let shootTimer = 0;

let shake = 0;


/* =========================
   OBJECTEN
========================= */

let bullets = [];

let robots = [];

let particles = [];

let stars = [];


let keys = {};

let mouse = {

    x: W / 2,

    y: H / 2,

    down: false
};


let weapon = 0;


/* =========================
   HIGHSCORE
========================= */

let highscore =
    Number(
        localStorage.getItem(
            "spacebotsHighscore"
        ) || 0
    );


/* =========================
   STERREN
========================= */

for (let i = 0; i < 180; i++) {

    stars.push({

        x: Math.random() * W,

        y: Math.random() * H,

        r: Math.random() * 1.8 + .2,

        s: Math.random() * .7 + .15

    });

}


/* =========================
   WAPENS
========================= */

const weapons = [

    {
        name: "BLASTER",

        cool: 180,

        damage: 1,

        speed: 12,

        count: 1,

        spread: 0,

        size: 4
    },

    {
        name: "SPREAD",

        cool: 320,

        damage: 1,

        speed: 10,

        count: 3,

        spread: .25,

        size: 3
    },

    {
        name: "PLASMA",

        cool: 420,

        damage: 3,

        speed: 8,

        count: 1,

        spread: 0,

        size: 8
    }

];


/* =========================
   ROBOT TYPES
========================= */

const types = [

    {
        name: "SCOUT",

        color: "#22c55e",

        r: 17,

        speed: 1.25,

        hp: 1,

        points: 10
    },

    {
        name: "BRUTE",

        color: "#f97316",

        r: 25,

        speed: .7,

        hp: 4,

        points: 30
    },

    {
        name: "ELITE",

        color: "#a855f7",

        r: 20,

        speed: 1.05,

        hp: 2,

        points: 25
    },

    {
        name: "TANK",

        color: "#ef4444",

        r: 31,

        speed: .45,

        hp: 8,

        points: 60
    }

];


/* =========================
   SPELER
========================= */

const player = {

    x: W / 2,

    y: H / 2,

    r: 17,

    speed: 4.5,

    angle: 0

};


/* =========================
   ROBOT TEKENEN
========================= */

function drawRobot(type, x, y, scale = 1) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(scale, scale);


    ctx.strokeStyle = type.color;

    ctx.lineWidth = 2;

    ctx.fillStyle = type.color;


    /*
       Grote robots
    */

    if (
        type.name === "BRUTE" ||
        type.name === "TANK"
    ) {

        ctx.beginPath();

        ctx.moveTo(-type.r, 0);

        ctx.lineTo(
            -type.r * .6,
            -type.r * .8
        );

        ctx.lineTo(
            type.r * .6,
            -type.r * .8
        );

        ctx.lineTo(type.r, 0);

        ctx.lineTo(
            type.r * .6,
            type.r * .8
        );

        ctx.lineTo(
            -type.r * .6,
            type.r * .8
        );

        ctx.closePath();

        ctx.fill();

    } else {

        ctx.beginPath();

        ctx.rect(
            -type.r,
            -type.r,
            type.r * 2,
            type.r * 2
        );

        ctx.fill();

    }


    /*
       Robot ogen
    */

    ctx.fillStyle = "#fef08a";

    ctx.fillRect(
        -8,
        -5,
        5,
        5
    );

    ctx.fillRect(
        3,
        -5,
        5,
        5
    );


    /*
       Mond
    */

    ctx.fillStyle = "#0f172a";

    ctx.fillRect(
        -5,
        7,
        10,
        3
    );


    ctx.restore();

}


/* =========================
   GAME RESET
========================= */

function resetGame() {

    score = 0;

    health = 100;

    wave = 1;

    kills = 0;

    waveKills = 0;

    bullets = [];

    robots = [];

    particles = [];

    player.x = W / 2;

    player.y = H / 2;

    spawnTimer = 0;

    shootTimer = 0;


    scoreEl.textContent = score;

    waveEl.textContent = wave;


    setHealth();

    selectWeapon(0);

}


/* =========================
   GAME START
========================= */

function startGame() {

    resetGame();

    menu.classList.add("hidden");

    game.classList.remove("hidden");

    gameOver.classList.add("hidden");


    running = true;

    paused = false;


    last = performance.now();


    requestAnimationFrame(gameLoop);

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    running = false;


    gameOver.classList.remove(
        "hidden"
    );


    document.getElementById(
        "finalScore"
    ).textContent = score;


    highscore =
        Math.max(
            highscore,
            score
        );


    localStorage.setItem(
        "spacebotsHighscore",
        highscore
    );


    document.getElementById(
        "finalHighscore"
    ).textContent = highscore;


    beep(
        100,
        .25,
        "sawtooth"
    );

}


/* =========================
   HEALTH
========================= */

function setHealth() {

    health =
        Math.max(
            0,
            Math.min(
                100,
                health
            )
        );


    healthFill.style.width =
        health + "%";


    healthText.textContent =
        Math.ceil(health);


    if (health < 30) {

        healthFill.style.background =
            "#ef4444";

    } else if (health < 60) {

        healthFill.style.background =
            "#f59e0b";

    } else {

        healthFill.style.background =
            "#22c55e";
    }

}


/* =========================
   WAPEN KIEZEN
========================= */

function selectWeapon(index) {

    weapon = index;


    weaponName.textContent =
        weapons[index].name;


    document
        .querySelectorAll(
            "#weaponBar button"
        )
        .forEach(
            (button, number) => {

                button.classList.toggle(
                    "active",
                    number === index
                );

            }
        );

}


/* =========================
   ROBOT SPAWNEN
========================= */

function spawnRobot() {

    let side =
        Math.floor(
            Math.random() * 4
        );


    let x;

    let y;


    if (side === 0) {

        x = -45;

        y = Math.random() * H;

    } else if (side === 1) {

        x = W + 45;

        y = Math.random() * H;

    } else if (side === 2) {

        x = Math.random() * W;

        y = -45;

    } else {

        x = Math.random() * W;

        y = H + 45;

    }


    const maxType =
        Math.min(
            types.length - 1,
            Math.floor(
                (wave - 1) / 3
            )
        );


    const type =
        types[
            Math.floor(
                Math.random() *
                (maxType + 1)
            )
        ];


    robots.push({

        x: x,

        y: y,

        type: type,

        hp:
            type.hp +
            Math.floor(wave / 5),

        r: type.r,

        speed:
            type.speed *
            (1 + wave * .035),

        flash: 0

    });

}


/* =========================
   SCHIETEN
========================= */

function shoot() {

    const w =
        weapons[weapon];


    if (shootTimer > 0) {

        return;

    }


    shootTimer =
        w.cool;


    const angle =
        Math.atan2(
            mouse.y - player.y,
            mouse.x - player.x
        );


    for (
        let i = 0;
        i < w.count;
        i++
    ) {

        const bulletAngle =
            angle +
            (
                i -
                (w.count - 1) / 2
            ) *
            w.spread;


        bullets.push({

            x:
                player.x +
                Math.cos(bulletAngle) *
                20,

            y:
                player.y +
                Math.sin(bulletAngle) *
                20,

            vx:
                Math.cos(bulletAngle) *
                w.speed,

            vy:
                Math.sin(bulletAngle) *
                w.speed,

            r: w.size,

            damage: w.damage,

            life: 80,

            color:
                weapon === 2
                    ? "#c084fc"
                    : "#67e8f9"

        });

    }


    beep(
        180 + weapon * 100,
        .035,
        "square"
    );

}


/* =========================
   EXPLOSIE
========================= */

function explode(x, y, type) {

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            Math.random() * 4 + 1;


        particles.push({

            x: x,

            y: y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                35 +
                Math.random() * 25,

            r:
                Math.random() * 4 + 2,

            color:
                type.color

        });

    }


    shake = 5;


    beep(
        70,
        .06,
        "triangle"
    );

}


/* =========================
   SPELER SCHADE
========================= */

function damage(amount) {

    health -= amount;

    setHealth();

    shake = 7;


    beep(
        55,
        .08,
        "sawtooth"
    );


    if (health <= 0) {

        endGame();

    }

}


/* =========================
   UPDATE
========================= */

function update(dt) {

    if (!running || paused) {

        return;

    }


    /*
       Speler bewegen
    */

    const speed =
        player.speed * dt;


    if (
        keys.w ||
        keys.ArrowUp
    ) {

        player.y -= speed;

    }


    if (
        keys.s ||
        keys.ArrowDown
    ) {

        player.y += speed;

    }


    if (
        keys.a ||
        keys.ArrowLeft
    ) {

        player.x -= speed;

    }


    if (
        keys.d ||
        keys.ArrowRight
    ) {

        player.x += speed;

    }


    /*
       Binnen scherm houden
    */

    player.x =
        Math.max(
            20,
            Math.min(
                W - 20,
                player.x
            )
        );


    player.y =
        Math.max(
            20,
            Math.min(
                H - 20,
                player.y
            )
        );


    /*
       Richting muis
    */

    player.angle =
        Math.atan2(
            mouse.y - player.y,
            mouse.x - player.x
        );


    /*
       Automatisch schieten
    */

    if (mouse.down) {

        shoot();

    }


    shootTimer =
        Math.max(
            0,
            shootTimer - dt
        );


    /*
       Robots spawnen
    */

    spawnTimer -= dt;


    if (spawnTimer <= 0) {

        spawnRobot();


        spawnTimer =
            Math.max(
                260,
                900 - wave * 25
            ) *
            (
                .7 +
                Math.random() * .4
            );

    }


    /* =====================
       KOGELS
    ===================== */

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        bullet.x +=
            bullet.vx * dt;


        bullet.y +=
            bullet.vy * dt;


        bullet.life -= dt;


        if (
            bullet.life <= 0 ||
            bullet.x < -20 ||
            bullet.x > W + 20 ||
            bullet.y < -20 ||
            bullet.y > H + 20
        ) {

            bullets.splice(i, 1);

            continue;

        }


        /*
           Kogel tegen robot
        */

        for (
            let j = robots.length - 1;
            j >= 0;
            j--
        ) {

            const robot =
                robots[j];


            const distance =
                Math.hypot(
                    bullet.x -
                    robot.x,

                    bullet.y -
                    robot.y
                );


            if (
                distance <
                bullet.r +
                robot.r * .8
            ) {

                robot.hp -=
                    bullet.damage;


                robot.flash = 5;


                bullets.splice(
                    i,
                    1
                );


                /*
                   Robot dood
                */

                if (
                    robot.hp <= 0
                ) {

                    score +=
                        robot.type.points;


                    waveKills++;

                    kills++;


                    explode(
                        robot.x,
                        robot.y,
                        robot.type
                    );


                    robots.splice(
                        j,
                        1
                    );


                    scoreEl.textContent =
                        score;


                    /*
                       Nieuwe wave
                    */

                    if (
                        waveKills >=
                        5 + wave * 3
                    ) {

                        wave++;

                        waveKills = 0;

                        waveEl.textContent =
                            wave;


                        beep(
                            700,
                            .12,
                            "sine"
                        );

                    }

                }


                break;

            }

        }

    }


    /* =====================
       ROBOTS
    ===================== */

    for (
        let i = robots.length - 1;
        i >= 0;
        i--
    ) {

        const robot =
            robots[i];


        const angle =
            Math.atan2(
                player.y - robot.y,
                player.x - robot.x
            );


        robot.x +=
            Math.cos(angle) *
            robot.speed *
            dt;


        robot.y +=
            Math.sin(angle) *
            robot.speed *
            dt;


        robot.flash =
            Math.max(
                0,
                robot.flash - dt
            );


        /*
           Robot raakt speler
        */

        if (
            Math.hypot(
                player.x -
                robot.x,

                player.y -
                robot.y
            )
            <
            player.r +
            robot.r * .75
        ) {

            robots.splice(
                i,
                1
            );


            if (
                robot.type.name ===
                "TANK"
            ) {

                damage(25);

            } else {

                damage(15);

            }

        }

    }


    /* =====================
       EXPLOSIE DEELTJES
    ===================== */

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx * dt;


        particle.y +=
            particle.vy * dt;


        particle.vx *= .96;

        particle.vy *= .96;


        particle.life -= dt;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================
   TEKENEN
========================= */

function draw() {

    ctx.save();


    /*
       Scherm shake
    */

    if (shake > 0) {

        ctx.translate(
            (Math.random() - .5) *
            shake,

            (Math.random() - .5) *
            shake
        );


        shake *= .85;

    }


    /*
       Ruimte achtergrond
    */

    const background =
        ctx.createRadialGradient(
            W / 2,
            H / 2,
            30,

            W / 2,
            H / 2,
            800
        );


    background.addColorStop(
        0,
        "#172554"
    );


    background.addColorStop(
        1,
        "#020617"
    );


    ctx.fillStyle =
        background;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Ruimtegrit
    */

    ctx.strokeStyle =
        "#1e3a5f55";


    for (
        let x = 0;
        x < W;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < H;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            W,
            y
        );

        ctx.stroke();

    }


    /*
       Sterren
    */

    stars.forEach(
        star => {

            star.y += star.s;


            if (
                star.y > H
            ) {

                star.y = 0;

            }


            ctx.fillStyle =
                "#ffffff";


            ctx.globalAlpha =
                .35 +
                star.r / 3;


            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                star.r,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;


    /*
       Kogels
    */

    bullets.forEach(
        bullet => {

            ctx.shadowBlur = 15;

            ctx.shadowColor =
                bullet.color;

            ctx.fillStyle =
                bullet.color;


            ctx.beginPath();

            ctx.arc(
                bullet.x,
                bullet.y,
                bullet.r,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.shadowBlur = 0;

        }
    );


    /*
       Robots
    */

    robots.forEach(
        robot => {

            drawRobot(
                robot.type,
                robot.x,
                robot.y
            );


            /*
               Healthbar boven robot
            */

            if (
                robot.type.hp > 1
            ) {

                ctx.fillStyle =
                    "#111827";


                ctx.fillRect(
                    robot.x -
                    robot.r,

                    robot.y -
                    robot.r -
                    9,

                    robot.r * 2,

                    4
                );


                ctx.fillStyle =
                    "#22c55e";


                const maxHp =
                    robot.type.hp +
                    Math.floor(
                        wave / 5
                    );


                ctx.fillRect(
                    robot.x -
                    robot.r,

                    robot.y -
                    robot.r -
                    9,

                    robot.r *
                    2 *
                    Math.max(
                        0,
                        robot.hp /
                        maxHp
                    ),

                    4
                );

            }

        }
    );


    /*
       Speler
    */

    ctx.save();


    ctx.translate(
        player.x,
        player.y
    );


    ctx.rotate(
        player.angle
    );


    /*
       Blauwe body
    */

    ctx.fillStyle =
        "#38bdf8";


    ctx.shadowBlur = 18;

    ctx.shadowColor =
        "#38bdf8";


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.r,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    /*
       Hoofd
    */

    ctx.fillStyle =
        "#e0f2fe";


    ctx.beginPath();

    ctx.arc(
        -4,
        -3,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Wapen
    */

    ctx.fillStyle =
        "#64748b";


    ctx.fillRect(
        8,
        -5,
        25,
        10
    );


    ctx.restore();


    /*
       Explosie particles
    */

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life / 45
                );


            ctx.fillStyle =
                particle.color;


            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.r,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;


    ctx.restore();

}


/* =========================
   GAME LOOP
========================= */

function gameLoop(time) {

    const dt =
        Math.min(
            2,
            (time - last) / 16.67
        );


    last = time;


    update(dt);

    draw();


    if (running) {

        requestAnimationFrame(
            gameLoop
        );

    }

}


/* =========================
   GELUID
========================= */

function beep(
    frequency,
    duration,
    type
) {

    try {

        const audio =
            beep.audio ||
            (
                beep.audio =
                new AudioContext()
            );


        const oscillator =
            audio.createOscillator();


        const gain =
            audio.createGain();


        oscillator.type =
            type;


        oscillator.frequency.value =
            frequency;


        gain.gain.value =
            .035;


        oscillator.connect(gain);

        gain.connect(
            audio.destination
        );


        oscillator.start();


        gain.gain
            .exponentialRampToValueAtTime(
                .001,
                audio.currentTime +
                duration
            );


        oscillator.stop(
            audio.currentTime +
            duration
        );

    } catch (error) {

        console.log(
            "Audio niet beschikbaar"
        );

    }

}


/* =========================
   TOETSENBORD
========================= */

window.addEventListener(
    "keydown",
    event => {

        keys[event.key] = true;


        const key =
            event.key.toLowerCase();


        if (key === "1") {

            selectWeapon(0);

        }


        if (key === "2") {

            selectWeapon(1);

        }


        if (key === "3") {

            selectWeapon(2);

        }


        /*
           Pauze
        */

        if (
            key === "p" &&
            running
        ) {

            paused = !paused;


            pauseEl.classList.toggle(
                "hidden",
                !paused
            );

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.key] = false;

    }
);


/* =========================
   MUIS
========================= */

canvas.addEventListener(
    "mousemove",
    event => {

        const rect =
            canvas.getBoundingClientRect();


        mouse.x =
            (
                event.clientX -
                rect.left
            )
            *
            W /
            rect.width;


        mouse.y =
            (
                event.clientY -
                rect.top
            )
            *
            H /
            rect.height;

    }
);


canvas.addEventListener(
    "mousedown",
    () => {

        mouse.down = true;

        shoot();

    }
);


window.addEventListener(
    "mouseup",
    () => {

        mouse.down = false;

    }
);


/* =========================
   KNOPPEN
========================= */

document
    .getElementById("startBtn")
    .onclick =
    startGame;


document
    .getElementById("restartBtn")
    .onclick =
    startGame;


document
    .querySelectorAll(
        "#weaponBar button"
    )
    .forEach(
        button => {

            button.onclick = () => {

                selectWeapon(
                    Number(
                        button.dataset.w
                    )
                );

            };

        }
    );


/* =========================
   STARTINSTELLINGEN
========================= */

selectWeapon(0);const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================
   HTML ELEMENTEN
========================= */

const scoreEl =
    document.getElementById("score");

const waveEl =
    document.getElementById("wave");

const healthFill =
    document.getElementById("healthFill");

const healthText =
    document.getElementById("healthText");

const weaponName =
    document.getElementById("weaponName");

const menu =
    document.getElementById("menu");

const game =
    document.getElementById("game");

const gameOver =
    document.getElementById("gameOver");

const pauseEl =
    document.getElementById("pause");


const W = canvas.width;
const H = canvas.height;


/* =========================
   GAME VARIABELEN
========================= */

let running = false;

let paused = false;

let score = 0;

let health = 100;

let wave = 1;

let kills = 0;

let waveKills = 0;

let last = 0;

let spawnTimer = 0;

let shootTimer = 0;

let shake = 0;


/* =========================
   OBJECTEN
========================= */

let bullets = [];

let robots = [];

let particles = [];

let stars = [];


let keys = {};

let mouse = {

    x: W / 2,

    y: H / 2,

    down: false
};


let weapon = 0;


/* =========================
   HIGHSCORE
========================= */

let highscore =
    Number(
        localStorage.getItem(
            "spacebotsHighscore"
        ) || 0
    );


/* =========================
   STERREN
========================= */

for (let i = 0; i < 180; i++) {

    stars.push({

        x: Math.random() * W,

        y: Math.random() * H,

        r: Math.random() * 1.8 + .2,

        s: Math.random() * .7 + .15

    });

}


/* =========================
   WAPENS
========================= */

const weapons = [

    {
        name: "BLASTER",

        cool: 180,

        damage: 1,

        speed: 12,

        count: 1,

        spread: 0,

        size: 4
    },

    {
        name: "SPREAD",

        cool: 320,

        damage: 1,

        speed: 10,

        count: 3,

        spread: .25,

        size: 3
    },

    {
        name: "PLASMA",

        cool: 420,

        damage: 3,

        speed: 8,

        count: 1,

        spread: 0,

        size: 8
    }

];


/* =========================
   ROBOT TYPES
========================= */

const types = [

    {
        name: "SCOUT",

        color: "#22c55e",

        r: 17,

        speed: 1.25,

        hp: 1,

        points: 10
    },

    {
        name: "BRUTE",

        color: "#f97316",

        r: 25,

        speed: .7,

        hp: 4,

        points: 30
    },

    {
        name: "ELITE",

        color: "#a855f7",

        r: 20,

        speed: 1.05,

        hp: 2,

        points: 25
    },

    {
        name: "TANK",

        color: "#ef4444",

        r: 31,

        speed: .45,

        hp: 8,

        points: 60
    }

];


/* =========================
   SPELER
========================= */

const player = {

    x: W / 2,

    y: H / 2,

    r: 17,

    speed: 4.5,

    angle: 0

};


/* =========================
   ROBOT TEKENEN
========================= */

function drawRobot(type, x, y, scale = 1) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(scale, scale);


    ctx.strokeStyle = type.color;

    ctx.lineWidth = 2;

    ctx.fillStyle = type.color;


    /*
       Grote robots
    */

    if (
        type.name === "BRUTE" ||
        type.name === "TANK"
    ) {

        ctx.beginPath();

        ctx.moveTo(-type.r, 0);

        ctx.lineTo(
            -type.r * .6,
            -type.r * .8
        );

        ctx.lineTo(
            type.r * .6,
            -type.r * .8
        );

        ctx.lineTo(type.r, 0);

        ctx.lineTo(
            type.r * .6,
            type.r * .8
        );

        ctx.lineTo(
            -type.r * .6,
            type.r * .8
        );

        ctx.closePath();

        ctx.fill();

    } else {

        ctx.beginPath();

        ctx.rect(
            -type.r,
            -type.r,
            type.r * 2,
            type.r * 2
        );

        ctx.fill();

    }


    /*
       Robot ogen
    */

    ctx.fillStyle = "#fef08a";

    ctx.fillRect(
        -8,
        -5,
        5,
        5
    );

    ctx.fillRect(
        3,
        -5,
        5,
        5
    );


    /*
       Mond
    */

    ctx.fillStyle = "#0f172a";

    ctx.fillRect(
        -5,
        7,
        10,
        3
    );


    ctx.restore();

}


/* =========================
   GAME RESET
========================= */

function resetGame() {

    score = 0;

    health = 100;

    wave = 1;

    kills = 0;

    waveKills = 0;

    bullets = [];

    robots = [];

    particles = [];

    player.x = W / 2;

    player.y = H / 2;

    spawnTimer = 0;

    shootTimer = 0;


    scoreEl.textContent = score;

    waveEl.textContent = wave;


    setHealth();

    selectWeapon(0);

}


/* =========================
   GAME START
========================= */

function startGame() {

    resetGame();

    menu.classList.add("hidden");

    game.classList.remove("hidden");

    gameOver.classList.add("hidden");


    running = true;

    paused = false;


    last = performance.now();


    requestAnimationFrame(gameLoop);

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    running = false;


    gameOver.classList.remove(
        "hidden"
    );


    document.getElementById(
        "finalScore"
    ).textContent = score;


    highscore =
        Math.max(
            highscore,
            score
        );


    localStorage.setItem(
        "spacebotsHighscore",
        highscore
    );


    document.getElementById(
        "finalHighscore"
    ).textContent = highscore;


    beep(
        100,
        .25,
        "sawtooth"
    );

}


/* =========================
   HEALTH
========================= */

function setHealth() {

    health =
        Math.max(
            0,
            Math.min(
                100,
                health
            )
        );


    healthFill.style.width =
        health + "%";


    healthText.textContent =
        Math.ceil(health);


    if (health < 30) {

        healthFill.style.background =
            "#ef4444";

    } else if (health < 60) {

        healthFill.style.background =
            "#f59e0b";

    } else {

        healthFill.style.background =
            "#22c55e";
    }

}


/* =========================
   WAPEN KIEZEN
========================= */

function selectWeapon(index) {

    weapon = index;


    weaponName.textContent =
        weapons[index].name;


    document
        .querySelectorAll(
            "#weaponBar button"
        )
        .forEach(
            (button, number) => {

                button.classList.toggle(
                    "active",
                    number === index
                );

            }
        );

}


/* =========================
   ROBOT SPAWNEN
========================= */

function spawnRobot() {

    let side =
        Math.floor(
            Math.random() * 4
        );


    let x;

    let y;


    if (side === 0) {

        x = -45;

        y = Math.random() * H;

    } else if (side === 1) {

        x = W + 45;

        y = Math.random() * H;

    } else if (side === 2) {

        x = Math.random() * W;

        y = -45;

    } else {

        x = Math.random() * W;

        y = H + 45;

    }


    const maxType =
        Math.min(
            types.length - 1,
            Math.floor(
                (wave - 1) / 3
            )
        );


    const type =
        types[
            Math.floor(
                Math.random() *
                (maxType + 1)
            )
        ];


    robots.push({

        x: x,

        y: y,

        type: type,

        hp:
            type.hp +
            Math.floor(wave / 5),

        r: type.r,

        speed:
            type.speed *
            (1 + wave * .035),

        flash: 0

    });

}


/* =========================
   SCHIETEN
========================= */

function shoot() {

    const w =
        weapons[weapon];


    if (shootTimer > 0) {

        return;

    }


    shootTimer =
        w.cool;


    const angle =
        Math.atan2(
            mouse.y - player.y,
            mouse.x - player.x
        );


    for (
        let i = 0;
        i < w.count;
        i++
    ) {

        const bulletAngle =
            angle +
            (
                i -
                (w.count - 1) / 2
            ) *
            w.spread;


        bullets.push({

            x:
                player.x +
                Math.cos(bulletAngle) *
                20,

            y:
                player.y +
                Math.sin(bulletAngle) *
                20,

            vx:
                Math.cos(bulletAngle) *
                w.speed,

            vy:
                Math.sin(bulletAngle) *
                w.speed,

            r: w.size,

            damage: w.damage,

            life: 80,

            color:
                weapon === 2
                    ? "#c084fc"
                    : "#67e8f9"

        });

    }


    beep(
        180 + weapon * 100,
        .035,
        "square"
    );

}


/* =========================
   EXPLOSIE
========================= */

function explode(x, y, type) {

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            Math.random() * 4 + 1;


        particles.push({

            x: x,

            y: y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                35 +
                Math.random() * 25,

            r:
                Math.random() * 4 + 2,

            color:
                type.color

        });

    }


    shake = 5;


    beep(
        70,
        .06,
        "triangle"
    );

}


/* =========================
   SPELER SCHADE
========================= */

function damage(amount) {

    health -= amount;

    setHealth();

    shake = 7;


    beep(
        55,
        .08,
        "sawtooth"
    );


    if (health <= 0) {

        endGame();

    }

}


/* =========================
   UPDATE
========================= */

function update(dt) {

    if (!running || paused) {

        return;

    }


    /*
       Speler bewegen
    */

    const speed =
        player.speed * dt;


    if (
        keys.w ||
        keys.ArrowUp
    ) {

        player.y -= speed;

    }


    if (
        keys.s ||
        keys.ArrowDown
    ) {

        player.y += speed;

    }


    if (
        keys.a ||
        keys.ArrowLeft
    ) {

        player.x -= speed;

    }


    if (
        keys.d ||
        keys.ArrowRight
    ) {

        player.x += speed;

    }


    /*
       Binnen scherm houden
    */

    player.x =
        Math.max(
            20,
            Math.min(
                W - 20,
                player.x
            )
        );


    player.y =
        Math.max(
            20,
            Math.min(
                H - 20,
                player.y
            )
        );


    /*
       Richting muis
    */

    player.angle =
        Math.atan2(
            mouse.y - player.y,
            mouse.x - player.x
        );


    /*
       Automatisch schieten
    */

    if (mouse.down) {

        shoot();

    }


    shootTimer =
        Math.max(
            0,
            shootTimer - dt
        );


    /*
       Robots spawnen
    */

    spawnTimer -= dt;


    if (spawnTimer <= 0) {

        spawnRobot();


        spawnTimer =
            Math.max(
                260,
                900 - wave * 25
            ) *
            (
                .7 +
                Math.random() * .4
            );

    }


    /* =====================
       KOGELS
    ===================== */

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        bullet.x +=
            bullet.vx * dt;


        bullet.y +=
            bullet.vy * dt;


        bullet.life -= dt;


        if (
            bullet.life <= 0 ||
            bullet.x < -20 ||
            bullet.x > W + 20 ||
            bullet.y < -20 ||
            bullet.y > H + 20
        ) {

            bullets.splice(i, 1);

            continue;

        }


        /*
           Kogel tegen robot
        */

        for (
            let j = robots.length - 1;
            j >= 0;
            j--
        ) {

            const robot =
                robots[j];


            const distance =
                Math.hypot(
                    bullet.x -
                    robot.x,

                    bullet.y -
                    robot.y
                );


            if (
                distance <
                bullet.r +
                robot.r * .8
            ) {

                robot.hp -=
                    bullet.damage;


                robot.flash = 5;


                bullets.splice(
                    i,
                    1
                );


                /*
                   Robot dood
                */

                if (
                    robot.hp <= 0
                ) {

                    score +=
                        robot.type.points;


                    waveKills++;

                    kills++;


                    explode(
                        robot.x,
                        robot.y,
                        robot.type
                    );


                    robots.splice(
                        j,
                        1
                    );


                    scoreEl.textContent =
                        score;


                    /*
                       Nieuwe wave
                    */

                    if (
                        waveKills >=
                        5 + wave * 3
                    ) {

                        wave++;

                        waveKills = 0;

                        waveEl.textContent =
                            wave;


                        beep(
                            700,
                            .12,
                            "sine"
                        );

                    }

                }


                break;

            }

        }

    }


    /* =====================
       ROBOTS
    ===================== */

    for (
        let i = robots.length - 1;
        i >= 0;
        i--
    ) {

        const robot =
            robots[i];


        const angle =
            Math.atan2(
                player.y - robot.y,
                player.x - robot.x
            );


        robot.x +=
            Math.cos(angle) *
            robot.speed *
            dt;


        robot.y +=
            Math.sin(angle) *
            robot.speed *
            dt;


        robot.flash =
            Math.max(
                0,
                robot.flash - dt
            );


        /*
           Robot raakt speler
        */

        if (
            Math.hypot(
                player.x -
                robot.x,

                player.y -
                robot.y
            )
            <
            player.r +
            robot.r * .75
        ) {

            robots.splice(
                i,
                1
            );


            if (
                robot.type.name ===
                "TANK"
            ) {

                damage(25);

            } else {

                damage(15);

            }

        }

    }


    /* =====================
       EXPLOSIE DEELTJES
    ===================== */

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx * dt;


        particle.y +=
            particle.vy * dt;


        particle.vx *= .96;

        particle.vy *= .96;


        particle.life -= dt;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================
   TEKENEN
========================= */

function draw() {

    ctx.save();


    /*
       Scherm shake
    */

    if (shake > 0) {

        ctx.translate(
            (Math.random() - .5) *
            shake,

            (Math.random() - .5) *
            shake
        );


        shake *= .85;

    }


    /*
       Ruimte achtergrond
    */

    const background =
        ctx.createRadialGradient(
            W / 2,
            H / 2,
            30,

            W / 2,
            H / 2,
            800
        );


    background.addColorStop(
        0,
        "#172554"
    );


    background.addColorStop(
        1,
        "#020617"
    );


    ctx.fillStyle =
        background;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Ruimtegrit
    */

    ctx.strokeStyle =
        "#1e3a5f55";


    for (
        let x = 0;
        x < W;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < H;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            W,
            y
        );

        ctx.stroke();

    }


    /*
       Sterren
    */

    stars.forEach(
        star => {

            star.y += star.s;


            if (
                star.y > H
            ) {

                star.y = 0;

            }


            ctx.fillStyle =
                "#ffffff";


            ctx.globalAlpha =
                .35 +
                star.r / 3;


            ctx.beginPath();

            ctx.arc(
                star.x,
                star.y,
                star.r,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;


    /*
       Kogels
    */

    bullets.forEach(
        bullet => {

            ctx.shadowBlur = 15;

            ctx.shadowColor =
                bullet.color;

            ctx.fillStyle =
                bullet.color;


            ctx.beginPath();

            ctx.arc(
                bullet.x,
                bullet.y,
                bullet.r,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.shadowBlur = 0;

        }
    );


    /*
       Robots
    */

    robots.forEach(
        robot => {

            drawRobot(
                robot.type,
                robot.x,
                robot.y
            );


            /*
               Healthbar boven robot
            */

            if (
                robot.type.hp > 1
            ) {

                ctx.fillStyle =
                    "#111827";


                ctx.fillRect(
                    robot.x -
                    robot.r,

                    robot.y -
                    robot.r -
                    9,

                    robot.r * 2,

                    4
                );


                ctx.fillStyle =
                    "#22c55e";


                const maxHp =
                    robot.type.hp +
                    Math.floor(
                        wave / 5
                    );


                ctx.fillRect(
                    robot.x -
                    robot.r,

                    robot.y -
                    robot.r -
                    9,

                    robot.r *
                    2 *
                    Math.max(
                        0,
                        robot.hp /
                        maxHp
                    ),

                    4
                );

            }

        }
    );


    /*
       Speler
    */

    ctx.save();


    ctx.translate(
        player.x,
        player.y
    );


    ctx.rotate(
        player.angle
    );


    /*
       Blauwe body
    */

    ctx.fillStyle =
        "#38bdf8";


    ctx.shadowBlur = 18;

    ctx.shadowColor =
        "#38bdf8";


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.r,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    /*
       Hoofd
    */

    ctx.fillStyle =
        "#e0f2fe";


    ctx.beginPath();

    ctx.arc(
        -4,
        -3,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /*
       Wapen
    */

    ctx.fillStyle =
        "#64748b";


    ctx.fillRect(
        8,
        -5,
        25,
        10
    );


    ctx.restore();


    /*
       Explosie particles
    */

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life / 45
                );


            ctx.fillStyle =
                particle.color;


            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.r,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;


    ctx.restore();

}


/* =========================
   GAME LOOP
========================= */

function gameLoop(time) {

    const dt =
        Math.min(
            2,
            (time - last) / 16.67
        );


    last = time;


    update(dt);

    draw();


    if (running) {

        requestAnimationFrame(
            gameLoop
        );

    }

}


/* =========================
   GELUID
========================= */

function beep(
    frequency,
    duration,
    type
) {

    try {

        const audio =
            beep.audio ||
            (
                beep.audio =
                new AudioContext()
            );


        const oscillator =
            audio.createOscillator();


        const gain =
            audio.createGain();


        oscillator.type =
            type;


        oscillator.frequency.value =
            frequency;


        gain.gain.value =
            .035;


        oscillator.connect(gain);

        gain.connect(
            audio.destination
        );


        oscillator.start();


        gain.gain
            .exponentialRampToValueAtTime(
                .001,
                audio.currentTime +
                duration
            );


        oscillator.stop(
            audio.currentTime +
            duration
        );

    } catch (error) {

        console.log(
            "Audio niet beschikbaar"
        );

    }

}


/* =========================
   TOETSENBORD
========================= */

window.addEventListener(
    "keydown",
    event => {

        keys[event.key] = true;


        const key =
            event.key.toLowerCase();


        if (key === "1") {

            selectWeapon(0);

        }


        if (key === "2") {

            selectWeapon(1);

        }


        if (key === "3") {

            selectWeapon(2);

        }


        /*
           Pauze
        */

        if (
            key === "p" &&
            running
        ) {

            paused = !paused;


            pauseEl.classList.toggle(
                "hidden",
                !paused
            );

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.key] = false;

    }
);


/* =========================
   MUIS
========================= */

canvas.addEventListener(
    "mousemove",
    event => {

        const rect =
            canvas.getBoundingClientRect();


        mouse.x =
            (
                event.clientX -
                rect.left
            )
            *
            W /
            rect.width;


        mouse.y =
            (
                event.clientY -
                rect.top
            )
            *
            H /
            rect.height;

    }
);


canvas.addEventListener(
    "mousedown",
    () => {

        mouse.down = true;

        shoot();

    }
);


window.addEventListener(
    "mouseup",
    () => {

        mouse.down = false;

    }
);


/* =========================
   KNOPPEN
========================= */

document
    .getElementById("startBtn")
    .onclick =
    startGame;


document
    .getElementById("restartBtn")
    .onclick =
    startGame;


document
    .querySelectorAll(
        "#weaponBar button"
    )
    .forEach(
        button => {

            button.onclick = () => {

                selectWeapon(
                    Number(
                        button.dataset.w
                    )
                );

            };

        }
    );


/* =========================
   STARTINSTELLINGEN
========================= */

selectWeapon(0);
