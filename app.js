// ============================================================
// CHOLA TEMPLE VIRTUAL WALKTHROUGH — Thanjavur Brihadisvara
// Three.js + WebXR | 100% Free, No Dependencies
// ============================================================

(function () {
    'use strict';

    // === GLOBALS ===
    let scene, camera, renderer, clock;
    let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
    let isLocked = false;
    let euler = new THREE.Euler(0, 0, 0, 'YXZ');
    let velocity = new THREE.Vector3();
    let direction = new THREE.Vector3();
    let playerHeight = 1.7;
    let moveSpeed = 5;
    let hotspots = [];
    let activeHotspot = null;
    let infoPanelOpen = false;
    let audioPlaying = true;
    let bgMusic = null;
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2(0, 0);
    let templeGroup;

    // === MATERIAL LIBRARY ===
    const MAT = {
        granite: () => new THREE.MeshStandardMaterial({
            color: 0x3a3028, roughness: 0.4, metalness: 0.1
        }),
        graniteLight: () => new THREE.MeshStandardMaterial({
            color: 0x5a4838, roughness: 0.5, metalness: 0.05
        }),
        sandstone: () => new THREE.MeshStandardMaterial({
            color: 0x8b7355, roughness: 0.6, metalness: 0.0
        }),
        gold: () => new THREE.MeshStandardMaterial({
            color: 0xd4a030, roughness: 0.3, metalness: 0.8,
            emissive: 0x3a2800, emissiveIntensity: 0.15
        }),
        bronze: () => new THREE.MeshStandardMaterial({
            color: 0x8b6914, roughness: 0.4, metalness: 0.7
        }),
        darkStone: () => new THREE.MeshStandardMaterial({
            color: 0x2a2018, roughness: 0.35, metalness: 0.1
        }),
        terracotta: () => new THREE.MeshStandardMaterial({
            color: 0x9c5a3c, roughness: 0.7, metalness: 0.0
        }),
        ground: () => new THREE.MeshStandardMaterial({
            color: 0x8a7a5a, roughness: 0.9, metalness: 0.0
        }),
        water: () => new THREE.MeshStandardMaterial({
            color: 0x2a4a3a, roughness: 0.1, metalness: 0.3,
            transparent: true, opacity: 0.7
        }),
        lamp: () => new THREE.MeshStandardMaterial({
            color: 0xffaa33, emissive: 0xff8800, emissiveIntensity: 1.0,
            transparent: true, opacity: 0.9
        }),
        red: () => new THREE.MeshStandardMaterial({
            color: 0x8b1a1a, roughness: 0.6
        }),
        white: () => new THREE.MeshStandardMaterial({
            color: 0xe8e0d0, roughness: 0.5
        })
    };

    // === INFO HOTSPOT DATA ===
    const HOTSPOT_DATA = [
        {
            id: 'vimana',
            position: { x: 0, y: 3, z: -2 },
            title: 'The Vimana — Crown of the Cholas',
            text: 'The Brihadisvara Temple\'s vimana (tower) soars to 66 meters — the tallest of its kind when built in 1010 CE by Rajaraja Chola I. The massive granite capstone at the top, weighing approximately 80 tonnes, was hauled up using a 6.4 km earthen ramp. This architectural marvel stood as the tallest structure in India for centuries. The vimana is a perfect expression of Chola imperial power — built to be seen from across the Kaveri plains, proclaiming "The Cholas rule here."',
            location: 'Main Sanctum'
        },
        {
            id: 'nandi',
            position: { x: 0, y: 1.5, z: 12 },
            title: 'Nandi — The Sacred Bull',
            text: 'This monolithic Nandi (Shiva\'s sacred bull mount) is carved from a single granite block, measuring 3.7m long, 2.6m tall, and weighing approximately 25 tonnes. Seated in the Nandi Mandapam facing the main sanctum, it symbolizes dharma (righteousness), strength, and unwavering devotion. In Chola tradition, Nandi also served as the divine intermediary — devotees would whisper their prayers into Nandi\'s ears, believing he would carry them directly to Lord Shiva.',
            location: 'Nandi Mandapam'
        },
        {
            id: 'pillars',
            position: { x: 12, y: 2, z: 5 },
            title: 'The Pillared Corridor — Prakara',
            text: 'The temple\'s inner corridor (prakara) features over 250 intricately carved pillars arranged in a cloister around the main shrine. Each pillar is a masterwork of Chola sculptural art — featuring dancing figures, mythological scenes, and floral motifs. The corridor was designed for ritual circumambulation (pradakshina), where devotees walk clockwise around the sanctum while meditating. The pillars create a mesmerizing play of light and shadow throughout the day.',
            location: 'Eastern Corridor'
        },
        {
            id: 'gopuram',
            position: { x: 0, y: 3, z: 30 },
            title: 'Gopuram — The Gateway Tower',
            text: 'Uniquely for Chola-era temples, the entrance gopuram (gateway tower) is significantly shorter than the main vimana — a deliberate design choice by Rajaraja I to emphasize the supremacy of the divine sanctum over the worldly entrance. Later Pandya and Nayak dynasties reversed this tradition, building ever-taller gopurams. The Brihadisvara\'s gopuram features carved dvarapalas (guardian figures) and elaborate stucco work depicting scenes from Shiva mythology.',
            location: 'Main Entrance'
        },
        {
            id: 'murals',
            position: { x: -10, y: 2, z: -5 },
            title: 'Chola Murals — Living Walls',
            text: 'The inner walls of the temple contain some of the finest surviving Chola-period paintings, dating to 1010 CE. These murals depict Lord Shiva in various forms — as Nataraja (cosmic dancer), Tripurantaka (destroyer of the three cities), and Dakshinamurthy (supreme teacher). The painters used natural pigments derived from minerals and plants, applied on wet lime plaster (fresco technique). Many murals were hidden under later Nayak-period paintings and were only rediscovered in the 1930s.',
            location: 'Inner Sanctum Walls'
        },
        {
            id: 'lingam',
            position: { x: 0, y: 1.5, z: -8 },
            title: 'The Great Lingam — Peruvudaiyar',
            text: 'The sanctum houses the Peruvudaiyar — one of the largest Shiva Lingams in India, standing at 3.7 meters tall. The name "Brihadisvara" literally means "the Great Lord." Rajaraja Chola I consecrated this temple to Lord Shiva as an expression of his devotion and imperial glory. The Lingam sits on a massive square base within the garbhagriha (womb chamber), directly beneath the soaring vimana tower, creating a vertical axis connecting earth to heaven.',
            location: 'Garbhagriha (Sanctum)'
        }
    ];

    // === LOADING ===
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    const loadingMessages = [
        'Quarrying granite from the earth...',
        'Carving sacred pillars...',
        'Raising the mighty vimana...',
        'Sculpting the Nandi...',
        'Painting divine murals...',
        'Lighting the oil lamps...',
        'Invoking the golden hour...',
        'The temple awaits you...'
    ];

    function updateLoading(progress, msgIndex) {
        loadingBar.style.width = progress + '%';
        if (msgIndex < loadingMessages.length) {
            loadingText.textContent = loadingMessages[msgIndex];
        }
    }

    // === INIT ===
    function init() {
        updateLoading(5, 0);

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1008);
        scene.fog = new THREE.FogExp2(0x2a1a0a, 0.008);

        // Camera
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.set(0, playerHeight, 35);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas3d'),
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.9;
        renderer.outputEncoding = THREE.sRGBEncoding;

        clock = new THREE.Clock();

        updateLoading(10, 0);

        // Build the scene
        buildLighting();
        updateLoading(20, 1);

        buildGround();
        updateLoading(30, 2);

        templeGroup = new THREE.Group();
        scene.add(templeGroup);

        buildVimana();
        updateLoading(45, 3);

        buildNandiMandapam();
        updateLoading(55, 3);

        buildPrakaraWalls();
        updateLoading(65, 4);

        buildPillarCorridor();
        updateLoading(75, 4);

        buildGopuram();
        updateLoading(80, 5);

        buildOilLamps();
        updateLoading(85, 5);

        buildDecorations();
        updateLoading(90, 6);

        createHotspots();
        updateLoading(95, 7);

        buildSurroundings();
        updateLoading(100, 7);

        // Events
        setupControls();
        window.addEventListener('resize', onResize);

        // Hide loading, show start
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
        }, 1200);

        // Start button
        document.getElementById('start-btn').addEventListener('click', startExperience);
        document.getElementById('close-info').addEventListener('click', closeInfoPanel);
        document.getElementById('audio-toggle').addEventListener('click', toggleAudio);

        // Begin render
        animate();
    }

    // === LIGHTING — Golden Hour ===
    function buildLighting() {
        // Warm ambient
        const ambient = new THREE.AmbientLight(0x4a3520, 0.4);
        scene.add(ambient);

        // Hemisphere (sky + ground bounce)
        const hemi = new THREE.HemisphereLight(0xffd4a0, 0x3a2810, 0.5);
        scene.add(hemi);

        // Main sun — low angle golden hour
        const sun = new THREE.DirectionalLight(0xffaa55, 1.8);
        sun.position.set(-30, 15, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 120;
        sun.shadow.camera.left = -50;
        sun.shadow.camera.right = 50;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        sun.shadow.bias = -0.0005;
        scene.add(sun);

        // Warm fill from opposite side
        const fill = new THREE.DirectionalLight(0xff8844, 0.4);
        fill.position.set(20, 8, -15);
        scene.add(fill);

        // Faint blue rim for depth
        const rim = new THREE.DirectionalLight(0x6688cc, 0.15);
        rim.position.set(0, 20, -30);
        scene.add(rim);
    }

    // === GROUND ===
    function buildGround() {
        // Main ground
        const groundGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
        // Add subtle height variation
        const positions = groundGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            // Keep temple area flat
            const distFromCenter = Math.sqrt(x * x + y * y);
            if (distFromCenter > 30) {
                positions.setZ(i, (Math.random() - 0.5) * 0.3);
            }
        }
        groundGeo.computeVertexNormals();

        const ground = new THREE.Mesh(groundGeo, MAT.ground());
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Temple platform (elevated)
        const platformGeo = new THREE.BoxGeometry(45, 1.2, 70);
        const platform = new THREE.Mesh(platformGeo, MAT.granite());
        platform.position.set(0, 0.6, 5);
        platform.receiveShadow = true;
        platform.castShadow = true;
        scene.add(platform);

        // Steps leading up
        for (let i = 0; i < 5; i++) {
            const stepGeo = new THREE.BoxGeometry(8 + i * 1, 0.24, 1.2);
            const step = new THREE.Mesh(stepGeo, MAT.graniteLight());
            step.position.set(0, 1.2 - i * 0.24, 30 + i * 1.2);
            step.receiveShadow = true;
            step.castShadow = true;
            scene.add(step);
        }
    }

    // === HELPER: Create tiered tower shape ===
    function createTieredTower(baseW, baseD, height, tiers, mat, opts = {}) {
        const group = new THREE.Group();
        const tierHeight = height / tiers;

        for (let i = 0; i < tiers; i++) {
            const scale = 1 - (i / tiers) * 0.6;
            const w = baseW * scale;
            const d = baseD * scale;
            const h = tierHeight * (1 - i * 0.05);

            const tierGeo = new THREE.BoxGeometry(w, h, d);
            const tierMesh = new THREE.Mesh(tierGeo, mat());
            tierMesh.position.y = i * tierHeight + h / 2;
            tierMesh.castShadow = true;
            tierMesh.receiveShadow = true;
            group.add(tierMesh);

            // Carved line detail on each tier
            if (i < tiers - 1) {
                const lineGeo = new THREE.BoxGeometry(w + 0.2, 0.15, d + 0.2);
                const lineMesh = new THREE.Mesh(lineGeo, MAT.graniteLight());
                lineMesh.position.y = (i + 1) * tierHeight;
                group.add(lineMesh);
            }
        }

        // Dome/Kalasam at top
        if (opts.kalasam !== false) {
            const domeGeo = new THREE.SphereGeometry(baseW * 0.15, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
            const dome = new THREE.Mesh(domeGeo, MAT.gold());
            dome.position.y = height;
            dome.castShadow = true;
            group.add(dome);

            // Kalasam finial
            const finialGeo = new THREE.CylinderGeometry(0.1, 0.2, baseW * 0.2, 8);
            const finial = new THREE.Mesh(finialGeo, MAT.gold());
            finial.position.y = height + baseW * 0.15;
            group.add(finial);

            const topBall = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                MAT.gold()
            );
            topBall.position.y = height + baseW * 0.15 + baseW * 0.1;
            group.add(topBall);
        }

        return group;
    }

    // === HELPER: Create a carved pillar ===
    function createPillar(height, radius, mat) {
        const group = new THREE.Group();

        // Square base
        const baseGeo = new THREE.BoxGeometry(radius * 3, height * 0.08, radius * 3);
        const base = new THREE.Mesh(baseGeo, mat || MAT.granite());
        base.position.y = height * 0.04;
        base.castShadow = true;
        group.add(base);

        // Main shaft (octagonal approximation)
        const shaftGeo = new THREE.CylinderGeometry(radius, radius * 1.1, height * 0.7, 8);
        const shaft = new THREE.Mesh(shaftGeo, mat || MAT.granite());
        shaft.position.y = height * 0.08 + height * 0.35;
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        group.add(shaft);

        // Decorative band middle
        const bandGeo = new THREE.CylinderGeometry(radius * 1.25, radius * 1.25, height * 0.04, 8);
        const band = new THREE.Mesh(bandGeo, MAT.graniteLight());
        band.position.y = height * 0.45;
        group.add(band);

        // Capital (bracket)
        const capGeo = new THREE.BoxGeometry(radius * 3.5, height * 0.06, radius * 3.5);
        const cap = new THREE.Mesh(capGeo, mat || MAT.granite());
        cap.position.y = height * 0.08 + height * 0.7 + height * 0.03;
        cap.castShadow = true;
        group.add(cap);

        // Corbel detail
        const corbelGeo = new THREE.BoxGeometry(radius * 4, height * 0.04, radius * 4);
        const corbel = new THREE.Mesh(corbelGeo, MAT.graniteLight());
        corbel.position.y = height * 0.08 + height * 0.7 + height * 0.08;
        group.add(corbel);

        return group;
    }

    // === VIMANA (Main Tower) ===
    function buildVimana() {
        // Base sanctum
        const sanctumGeo = new THREE.BoxGeometry(12, 8, 12);
        const sanctum = new THREE.Mesh(sanctumGeo, MAT.darkStone());
        sanctum.position.set(0, 5.2, -5);
        sanctum.castShadow = true;
        sanctum.receiveShadow = true;
        templeGroup.add(sanctum);

        // Decorative moldings on sanctum
        for (let i = 0; i < 4; i++) {
            const moldGeo = new THREE.BoxGeometry(12.4, 0.2, 12.4);
            const mold = new THREE.Mesh(moldGeo, MAT.graniteLight());
            mold.position.set(0, 1.4 + i * 2, -5);
            templeGroup.add(mold);
        }

        // The great vimana tower
        const vimana = createTieredTower(10, 10, 30, 13, MAT.granite);
        vimana.position.set(0, 9, -5);
        templeGroup.add(vimana);

        // Inner sanctum (dark interior)
        const innerGeo = new THREE.BoxGeometry(6, 6, 6);
        const innerMat = new THREE.MeshStandardMaterial({ color: 0x0a0805, roughness: 0.9 });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.set(0, 4.2, -5);
        templeGroup.add(inner);

        // Lingam
        const lingamBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16),
            MAT.darkStone()
        );
        lingamBase.position.set(0, 1.5, -5);
        templeGroup.add(lingamBase);

        const lingam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.4, 1.5, 16),
            MAT.darkStone()
        );
        lingam.position.set(0, 2.4, -5);
        templeGroup.add(lingam);

        const lingamTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 12),
            MAT.darkStone()
        );
        lingamTop.position.set(0, 3.2, -5);
        templeGroup.add(lingamTop);

        // Entrance to sanctum
        const doorGeo = new THREE.BoxGeometry(3, 5, 1);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x0a0805, roughness: 0.9 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 3.7, 1);
        templeGroup.add(door);

        // Niches on sanctum walls with deity suggestions
        const nichePositions = [
            { x: 6.1, z: -5, ry: Math.PI / 2 },
            { x: -6.1, z: -5, ry: -Math.PI / 2 },
            { x: 0, z: -11.1, ry: Math.PI }
        ];
        nichePositions.forEach(np => {
            const nicheGeo = new THREE.BoxGeometry(2, 3, 0.5);
            const nicheMat = new THREE.MeshStandardMaterial({ color: 0x1a1008 });
            const niche = new THREE.Mesh(nicheGeo, nicheMat);
            niche.position.set(np.x, 4, np.z);
            niche.rotation.y = np.ry;
            templeGroup.add(niche);

            // Deity figure silhouette
            const figGeo = new THREE.CylinderGeometry(0.3, 0.35, 2, 8);
            const fig = new THREE.Mesh(figGeo, MAT.bronze());
            fig.position.set(np.x * 0.95, 3.5, np.z * 0.95);
            templeGroup.add(fig);
        });
    }

    // === NANDI MANDAPAM ===
    function buildNandiMandapam() {
        // Mandapam structure (open pillared hall)
        const roofGeo = new THREE.BoxGeometry(8, 0.6, 8);
        const roof = new THREE.Mesh(roofGeo, MAT.granite());
        roof.position.set(0, 6, 14);
        roof.castShadow = true;
        templeGroup.add(roof);

        // Small tower on mandapam
        const miniVimana = createTieredTower(5, 5, 8, 6, MAT.granite);
        miniVimana.position.set(0, 6.3, 14);
        templeGroup.add(miniVimana);

        // Mandapam pillars
        const mPillarPositions = [
            [-3, 10.5], [3, 10.5], [-3, 17.5], [3, 17.5],
            [-3, 14], [3, 14]
        ];
        mPillarPositions.forEach(([x, z]) => {
            const pillar = createPillar(4.5, 0.3, MAT.graniteLight);
            pillar.position.set(x, 1.2, z);
            templeGroup.add(pillar);
        });

        // Nandi (simplified bull form)
        const nandiGroup = new THREE.Group();

        // Body
        const bodyGeo = new THREE.BoxGeometry(1.4, 1.4, 2.5);
        const body = new THREE.Mesh(bodyGeo, MAT.darkStone());
        body.position.y = 1;
        nandiGroup.add(body);

        // Back curve
        const backGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.3, 8, 1, false, 0, Math.PI);
        const back = new THREE.Mesh(backGeo, MAT.darkStone());
        back.rotation.x = Math.PI / 2;
        back.position.set(0, 1.7, 0);
        nandiGroup.add(back);

        // Head
        const headGeo = new THREE.BoxGeometry(0.8, 0.9, 0.9);
        const head = new THREE.Mesh(headGeo, MAT.darkStone());
        head.position.set(0, 1.8, -1.5);
        nandiGroup.add(head);

        // Snout
        const snoutGeo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
        const snout = new THREE.Mesh(snoutGeo, MAT.darkStone());
        snout.position.set(0, 1.5, -2);
        nandiGroup.add(snout);

        // Horns
        [-0.4, 0.4].forEach(x => {
            const hornGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.6, 6);
            const horn = new THREE.Mesh(hornGeo, MAT.graniteLight());
            horn.position.set(x, 2.3, -1.5);
            horn.rotation.z = x > 0 ? -0.4 : 0.4;
            nandiGroup.add(horn);
        });

        // Hump
        const humpGeo = new THREE.SphereGeometry(0.5, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hump = new THREE.Mesh(humpGeo, MAT.darkStone());
        hump.position.set(0, 1.7, 0.3);
        nandiGroup.add(hump);

        // Legs
        [[-0.5, -0.8], [0.5, -0.8], [-0.5, 0.8], [0.5, 0.8]].forEach(([x, z]) => {
            const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
            const leg = new THREE.Mesh(legGeo, MAT.darkStone());
            leg.position.set(x, 0.35, z);
            nandiGroup.add(leg);
        });

        // Platform for Nandi
        const nandiPlatGeo = new THREE.BoxGeometry(2.5, 0.3, 3.5);
        const nandiPlat = new THREE.Mesh(nandiPlatGeo, MAT.graniteLight());
        nandiPlat.position.y = -0.05;
        nandiGroup.add(nandiPlat);

        nandiGroup.position.set(0, 1.2, 14);
        templeGroup.add(nandiGroup);
    }

    // === PRAKARA WALLS ===
    function buildPrakaraWalls() {
        const wallHeight = 4;
        const wallThickness = 0.8;
        const outerW = 40;
        const outerD = 60;

        // North wall
        const northWall = new THREE.Mesh(
            new THREE.BoxGeometry(outerW, wallHeight, wallThickness),
            MAT.granite()
        );
        northWall.position.set(0, wallHeight / 2 + 1.2, -25);
        northWall.castShadow = true;
        northWall.receiveShadow = true;
        templeGroup.add(northWall);

        // South wall (with gap for entrance)
        const southWallLeft = new THREE.Mesh(
            new THREE.BoxGeometry(15, wallHeight, wallThickness),
            MAT.granite()
        );
        southWallLeft.position.set(-12.5, wallHeight / 2 + 1.2, 35);
        southWallLeft.castShadow = true;
        templeGroup.add(southWallLeft);

        const southWallRight = new THREE.Mesh(
            new THREE.BoxGeometry(15, wallHeight, wallThickness),
            MAT.granite()
        );
        southWallRight.position.set(12.5, wallHeight / 2 + 1.2, 35);
        southWallRight.castShadow = true;
        templeGroup.add(southWallRight);

        // East wall
        const eastWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, wallHeight, outerD),
            MAT.granite()
        );
        eastWall.position.set(outerW / 2, wallHeight / 2 + 1.2, 5);
        eastWall.castShadow = true;
        templeGroup.add(eastWall);

        // West wall
        const westWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, wallHeight, outerD),
            MAT.granite()
        );
        westWall.position.set(-outerW / 2, wallHeight / 2 + 1.2, 5);
        westWall.castShadow = true;
        templeGroup.add(westWall);

        // Wall-top detailing (mini shrines along walls)
        for (let i = -18; i <= 18; i += 4) {
            [[-25, 0], [35, 0]].forEach(([z, _]) => {
                if (z === 35 && Math.abs(i) < 5) return; // gap for entrance
                const miniShrine = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 1.5, 1.5),
                    MAT.graniteLight()
                );
                miniShrine.position.set(i, wallHeight + 1.2 + 0.75, z);
                templeGroup.add(miniShrine);

                const miniRoof = new THREE.Mesh(
                    new THREE.ConeGeometry(1.1, 1, 4),
                    MAT.granite()
                );
                miniRoof.position.set(i, wallHeight + 1.2 + 2, z);
                miniRoof.rotation.y = Math.PI / 4;
                templeGroup.add(miniRoof);
            });
        }
    }

    // === PILLAR CORRIDOR ===
    function buildPillarCorridor() {
        // Inner row of pillars along the practice walls
        const spacing = 3.5;

        // East corridor pillars
        for (let z = -20; z <= 30; z += spacing) {
            const pillar = createPillar(4, 0.25, MAT.graniteLight);
            pillar.position.set(17, 1.2, z);
            templeGroup.add(pillar);
        }

        // West corridor pillars
        for (let z = -20; z <= 30; z += spacing) {
            const pillar = createPillar(4, 0.25, MAT.graniteLight);
            pillar.position.set(-17, 1.2, z);
            templeGroup.add(pillar);
        }

        // North corridor pillars
        for (let x = -15; x <= 15; x += spacing) {
            const pillar = createPillar(4, 0.25, MAT.graniteLight);
            pillar.position.set(x, 1.2, -22);
            templeGroup.add(pillar);
        }

        // Corridor roofs
        const corridorRoofEast = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.3, 55),
            MAT.granite()
        );
        corridorRoofEast.position.set(17, 5.5, 5);
        templeGroup.add(corridorRoofEast);

        const corridorRoofWest = new THREE.Mesh(
            new THREE.BoxGeometry(5, 0.3, 55),
            MAT.granite()
        );
        corridorRoofWest.position.set(-17, 5.5, 5);
        templeGroup.add(corridorRoofWest);

        const corridorRoofNorth = new THREE.Mesh(
            new THREE.BoxGeometry(38, 0.3, 5),
            MAT.granite()
        );
        corridorRoofNorth.position.set(0, 5.5, -22);
        templeGroup.add(corridorRoofNorth);

        // Mandapam (front hall connecting to sanctum)
        const mandapamRoof = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.4, 12),
            MAT.granite()
        );
        mandapamRoof.position.set(0, 5.5, 5);
        templeGroup.add(mandapamRoof);

        // Mandapam pillars
        const mpPositions = [
            [-4, 0], [4, 0], [-4, 4], [4, 4], [-4, 8], [4, 8],
            [-4, -2], [4, -2]
        ];
        mpPositions.forEach(([x, z]) => {
            const p = createPillar(4, 0.28, MAT.granite);
            p.position.set(x, 1.2, z);
            templeGroup.add(p);
        });
    }

    // === GOPURAM (Entrance Tower) ===
    function buildGopuram() {
        // Base structure
        const gopBase = new THREE.Mesh(
            new THREE.BoxGeometry(10, 7, 5),
            MAT.granite()
        );
        gopBase.position.set(0, 4.7, 35);
        gopBase.castShadow = true;
        templeGroup.add(gopBase);

        // Entrance passage through gopuram
        const passage = new THREE.Mesh(
            new THREE.BoxGeometry(4, 5, 5.5),
            new THREE.MeshStandardMaterial({ color: 0x0a0805, roughness: 0.9 })
        );
        passage.position.set(0, 3.7, 35);
        templeGroup.add(passage);

        // Gopuram tower (shorter than vimana — historically accurate)
        const gopTower = createTieredTower(8, 4, 15, 7, MAT.granite);
        gopTower.position.set(0, 8.2, 35);
        templeGroup.add(gopTower);

        // Dvarapala (guardian) bases on either side
        [-3.5, 3.5].forEach(x => {
            const guardBase = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.5, 1.2),
                MAT.graniteLight()
            );
            guardBase.position.set(x, 1.5, 37.5);
            templeGroup.add(guardBase);

            // Simplified guardian figure
            const guardBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.3, 2.5, 8),
                MAT.bronze()
            );
            guardBody.position.set(x, 3, 37.5);
            templeGroup.add(guardBody);

            const guardHead = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 8, 8),
                MAT.bronze()
            );
            guardHead.position.set(x, 4.4, 37.5);
            templeGroup.add(guardHead);
        });
    }

    // === OIL LAMPS ===
    function buildOilLamps() {
        const lampPositions = [];

        // Along the mandapam
        for (let z = -1; z <= 9; z += 3) {
            lampPositions.push([-3, 1.8, z]);
            lampPositions.push([3, 1.8, z]);
        }
        // Around Nandi
        lampPositions.push([-2, 1.8, 12], [2, 1.8, 12], [-2, 1.8, 16], [2, 1.8, 16]);

        // Near sanctum entrance
        lampPositions.push([-1.5, 1.8, 0.5], [1.5, 1.8, 0.5]);

        lampPositions.forEach(([x, y, z]) => {
            // Lamp stand
            const standGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.6, 8);
            const stand = new THREE.Mesh(standGeo, MAT.bronze());
            stand.position.set(x, y, z);
            templeGroup.add(stand);

            // Lamp bowl
            const bowlGeo = new THREE.CylinderGeometry(0.12, 0.05, 0.1, 8);
            const bowl = new THREE.Mesh(bowlGeo, MAT.bronze());
            bowl.position.set(x, y + 0.35, z);
            templeGroup.add(bowl);

            // Flame (emissive sphere)
            const flameGeo = new THREE.SphereGeometry(0.06, 6, 6);
            const flame = new THREE.Mesh(flameGeo, MAT.lamp());
            flame.position.set(x, y + 0.45, z);
            flame.userData.isFlame = true;
            templeGroup.add(flame);

            // Point light
            const light = new THREE.PointLight(0xff8833, 0.4, 5, 2);
            light.position.set(x, y + 0.5, z);
            templeGroup.add(light);
        });
    }

    // === DECORATIONS ===
    function buildDecorations() {
        // Flag poles with Chola tiger flag
        [[-5, 25], [5, 25]].forEach(([x, z]) => {
            // Pole
            const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 10, 6);
            const pole = new THREE.Mesh(poleGeo, MAT.bronze());
            pole.position.set(x, 6.2, z);
            templeGroup.add(pole);

            // Flag (simple plane)
            const flagGeo = new THREE.PlaneGeometry(2, 1.2, 4, 3);
            const flagMat = new THREE.MeshStandardMaterial({
                color: 0xcc3300, side: THREE.DoubleSide, roughness: 0.8
            });
            const flag = new THREE.Mesh(flagGeo, flagMat);
            flag.position.set(x + 1, 10, z);
            flag.userData.isFlag = true;
            templeGroup.add(flag);
        });

        // Kolam / Rangoli patterns on floor (decorative circles)
        const kolamGeo = new THREE.RingGeometry(1.5, 2, 16);
        const kolamMat = new THREE.MeshStandardMaterial({
            color: 0xd4d0c8, roughness: 0.9, side: THREE.DoubleSide
        });
        const kolam = new THREE.Mesh(kolamGeo, kolamMat);
        kolam.rotation.x = -Math.PI / 2;
        kolam.position.set(0, 1.25, 20);
        templeGroup.add(kolam);

        const kolamInner = new THREE.Mesh(
            new THREE.RingGeometry(0.5, 1, 12),
            kolamMat
        );
        kolamInner.rotation.x = -Math.PI / 2;
        kolamInner.position.set(0, 1.25, 20);
        templeGroup.add(kolamInner);
    }

    // === SURROUNDINGS ===
    function buildSurroundings() {
        // Trees (simple)
        const treePositions = [
            [-28, 10], [28, 10], [-28, 25], [28, 25], [-28, -10], [28, -10],
            [-35, 0], [35, 0], [-35, 20], [35, 20],
            [-25, 40], [25, 40], [-30, -20], [30, -20]
        ];
        treePositions.forEach(([x, z]) => {
            // Trunk
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.3, 3, 6),
                new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 })
            );
            trunk.position.set(x, 1.5, z);
            trunk.castShadow = true;
            scene.add(trunk);

            // Canopy
            const canopy = new THREE.Mesh(
                new THREE.SphereGeometry(2 + Math.random(), 8, 6),
                new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.4, 0.2 + Math.random() * 0.1),
                    roughness: 0.8
                })
            );
            canopy.position.set(x, 4 + Math.random(), z);
            canopy.castShadow = true;
            scene.add(canopy);
        });

        // Distant mountains/hills
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const dist = 70 + Math.random() * 20;
            const hill = new THREE.Mesh(
                new THREE.ConeGeometry(15 + Math.random() * 10, 10 + Math.random() * 8, 6),
                new THREE.MeshStandardMaterial({ color: 0x3a3020, roughness: 0.9 })
            );
            hill.position.set(Math.cos(angle) * dist, 3, Math.sin(angle) * dist);
            scene.add(hill);
        }

        // Particles (dust in golden light)
        const particleCount = 500;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = Math.random() * 15 + 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60 + 5;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0xffcc88, size: 0.08, transparent: true, opacity: 0.4
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        particles.userData.isParticles = true;
        scene.add(particles);
    }

    // === HOTSPOTS ===
    function createHotspots() {
        HOTSPOT_DATA.forEach(data => {
            const group = new THREE.Group();

            // Glowing orb
            const orbGeo = new THREE.SphereGeometry(0.2, 12, 12);
            const orbMat = new THREE.MeshStandardMaterial({
                color: 0xffcc44, emissive: 0xffaa00, emissiveIntensity: 0.8,
                transparent: true, opacity: 0.7
            });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            group.add(orb);

            // Ring
            const ringGeo = new THREE.RingGeometry(0.3, 0.38, 16);
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0xffcc44, emissive: 0xffaa00, emissiveIntensity: 0.5,
                transparent: true, opacity: 0.5, side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            group.add(ring);

            // Point light
            const light = new THREE.PointLight(0xffaa00, 0.3, 4);
            group.add(light);

            group.position.set(data.position.x, data.position.y, data.position.z);
            group.userData.hotspotData = data;
            group.userData.isHotspot = true;

            templeGroup.add(group);
            hotspots.push(group);
        });
    }

    // === CONTROLS ===
    function setupControls() {
        const canvas = renderer.domElement;

        canvas.addEventListener('click', () => {
            if (!isLocked) {
                canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            isLocked = document.pointerLockElement === canvas;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isLocked) return;
            const sensitivity = 0.002;
            euler.setFromQuaternion(camera.quaternion);
            euler.y -= e.movementX * sensitivity;
            euler.x -= e.movementY * sensitivity;
            euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.x));
            camera.quaternion.setFromEuler(euler);
        });

        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveForward = true; break;
                case 'KeyS': case 'ArrowDown': moveBackward = true; break;
                case 'KeyA': case 'ArrowLeft': moveLeft = true; break;
                case 'KeyD': case 'ArrowRight': moveRight = true; break;
                case 'KeyE': interactWithHotspot(); break;
                case 'Escape':
                    if (infoPanelOpen) closeInfoPanel();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': moveForward = false; break;
                case 'KeyS': case 'ArrowDown': moveBackward = false; break;
                case 'KeyA': case 'ArrowLeft': moveLeft = false; break;
                case 'KeyD': case 'ArrowRight': moveRight = false; break;
            }
        });
    }

    // === MOVEMENT ===
    function updateMovement(delta) {
        if (!isLocked) return;

        velocity.x -= velocity.x * 8.0 * delta;
        velocity.z -= velocity.z * 8.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * moveSpeed * delta * 20;
        if (moveLeft || moveRight) velocity.x -= direction.x * moveSpeed * delta * 20;

        // Get forward and right vectors from camera
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

        // Apply movement
        camera.position.addScaledVector(forward, -velocity.z * delta);
        camera.position.addScaledVector(right, velocity.x * delta);

        // Keep player height constant
        camera.position.y = playerHeight;

        // Boundary clamping
        camera.position.x = Math.max(-30, Math.min(30, camera.position.x));
        camera.position.z = Math.max(-30, Math.min(50, camera.position.z));
    }

    // === HOTSPOT INTERACTION ===
    function checkHotspotProximity() {
        let closest = null;
        let closestDist = Infinity;

        hotspots.forEach(h => {
            const dist = camera.position.distanceTo(h.position);
            if (dist < 6 && dist < closestDist) {
                closest = h;
                closestDist = dist;
            }
        });

        const prompt = document.getElementById('interact-prompt');
        if (closest && !infoPanelOpen) {
            activeHotspot = closest;
            prompt.style.display = 'flex';
        } else if (!infoPanelOpen) {
            activeHotspot = null;
            prompt.style.display = 'none';
        }
    }

    function interactWithHotspot() {
        if (!activeHotspot) return;
        const data = activeHotspot.userData.hotspotData;
        document.getElementById('info-title').textContent = data.title;
        document.getElementById('info-text').textContent = data.text;
        document.getElementById('info-panel').style.display = 'block';
        document.getElementById('interact-prompt').style.display = 'none';
        document.getElementById('location-name').textContent = data.location;
        infoPanelOpen = true;
    }

    function closeInfoPanel() {
        document.getElementById('info-panel').style.display = 'none';
        infoPanelOpen = false;
    }

    // === LOCATION TRACKING ===
    function updateLocation() {
        if (infoPanelOpen) return;
        const z = camera.position.z;
        const x = camera.position.x;
        let name = 'Temple Courtyard';

        if (z < -15) name = 'Northern Prakara';
        else if (z < 0 && Math.abs(x) < 5) name = 'Main Sanctum Approach';
        else if (z < 5 && Math.abs(x) < 6) name = 'Maha Mandapam';
        else if (z >= 10 && z <= 18 && Math.abs(x) < 5) name = 'Nandi Mandapam';
        else if (z > 30) name = 'Gopuram Entrance';
        else if (Math.abs(x) > 14) name = 'Pillar Corridor';
        else if (z >= 18 && z <= 30) name = 'Southern Courtyard';

        document.getElementById('location-name').textContent = name;
    }

    // === MINIMAP ===
    function updateMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 150, 150);

        // Background
        ctx.fillStyle = 'rgba(13, 8, 5, 0.9)';
        ctx.fillRect(0, 0, 150, 150);

        // Scale: map space to minimap
        const scale = 1.8;
        const ox = 75;
        const oy = 75;

        function mapX(x) { return ox + x * scale; }
        function mapZ(z) { return oy - (z - 5) * scale; }

        // Draw walls
        ctx.strokeStyle = 'rgba(180, 140, 80, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX(-20), mapZ(35), 40 * scale, 60 * scale);

        // Draw temple structure
        ctx.fillStyle = 'rgba(180, 140, 80, 0.3)';
        ctx.fillRect(mapX(-6), mapZ(1), 12 * scale, 12 * scale);

        // Nandi
        ctx.fillStyle = 'rgba(180, 140, 80, 0.25)';
        ctx.fillRect(mapX(-2), mapZ(16), 4 * scale, 4 * scale);

        // Gopuram
        ctx.fillStyle = 'rgba(180, 140, 80, 0.25)';
        ctx.fillRect(mapX(-5), mapZ(37.5), 10 * scale, 5 * scale);

        // Player dot
        ctx.fillStyle = '#f0d68a';
        ctx.beginPath();
        ctx.arc(mapX(camera.position.x), mapZ(camera.position.z), 3, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        ctx.strokeStyle = '#f0d68a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mapX(camera.position.x), mapZ(camera.position.z));
        ctx.lineTo(
            mapX(camera.position.x) + dir.x * 8,
            mapZ(camera.position.z) + dir.z * 8
        );
        ctx.stroke();

        // Hotspot indicators
        ctx.fillStyle = 'rgba(255, 170, 0, 0.5)';
        hotspots.forEach(h => {
            ctx.beginPath();
            ctx.arc(mapX(h.position.x), mapZ(h.position.z), 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // === AUDIO ===
    function setupAudio() {
        // Try to load bg music (user provides the file)
        bgMusic = new Audio('veera-raja-veera.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.5;

        bgMusic.play().catch(() => {
            // If no file found or autoplay blocked, that's ok
            console.log('ℹ️ Place "veera-raja-veera.mp3" in the project folder to hear music.');
        });

        document.getElementById('audio-toggle').style.display = 'block';
    }

    function toggleAudio() {
        if (!bgMusic) return;
        const btn = document.getElementById('audio-toggle');
        if (audioPlaying) {
            bgMusic.pause();
            btn.textContent = '🔇';
        } else {
            bgMusic.play();
            btn.textContent = '🔊';
        }
        audioPlaying = !audioPlaying;
    }

    // === START ===
    function startExperience() {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('hud').style.display = 'block';
        renderer.domElement.requestPointerLock();
        setupAudio();
    }

    // === ANIMATION ===
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.1);
        frameCount++;

        // Update movement
        updateMovement(delta);

        // Animate hotspot orbs
        const time = clock.elapsedTime;
        hotspots.forEach((h, i) => {
            h.children[0].scale.setScalar(1 + Math.sin(time * 2 + i) * 0.15);
            h.children[1].rotation.x = time * 0.5;
            h.children[1].rotation.y = time * 0.3 + i;
        });

        // Animate flames (flicker)
        templeGroup.traverse(child => {
            if (child.userData.isFlame) {
                const flicker = 0.8 + Math.random() * 0.4;
                child.material.emissiveIntensity = flicker;
                child.scale.setScalar(0.8 + Math.random() * 0.4);
            }
        });

        // Animate flags
        templeGroup.traverse(child => {
            if (child.userData.isFlag) {
                const geo = child.geometry;
                const pos = geo.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    const x = pos.getX(i);
                    pos.setZ(i, Math.sin(x * 2 + time * 3) * 0.15);
                }
                pos.needsUpdate = true;
                geo.computeVertexNormals();
            }
        });

        // Animate particles
        scene.traverse(child => {
            if (child.userData.isParticles) {
                const pos = child.geometry.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    let y = pos.getY(i);
                    y += delta * 0.3;
                    if (y > 16) y = 1;
                    pos.setY(i, y);
                    pos.setX(i, pos.getX(i) + Math.sin(time + i) * delta * 0.1);
                }
                pos.needsUpdate = true;
            }
        });

        // Check hotspot proximity every 10 frames
        if (frameCount % 10 === 0) {
            checkHotspotProximity();
            updateLocation();
        }

        // Update minimap every 5 frames
        if (frameCount % 5 === 0) {
            updateMinimap();
        }

        renderer.render(scene, camera);
    }

    // === RESIZE ===
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // === BOOT ===
    window.addEventListener('DOMContentLoaded', init);
})();
