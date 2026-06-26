function createMaterial(scene, name, diffuse, specular = BABYLON.Color3.Black()) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    mat.diffuseColor = diffuse;
    mat.specularColor = specular;
    return mat;
}

const SLOT_LENGTH = 3.2;

function drawFullSlot(scene, root, name, lineMat, rowStartX, rowEndX, slotStartZ, slotLen, yBase) {
    const lineW = 0.07;
    const sideInset = 0.28;
    const leftX = rowStartX + sideInset;
    const rightX = rowEndX - sideInset;

    const left = BABYLON.MeshBuilder.CreateBox(name + "_slotLeft_" + rowStartX.toFixed(2) + "_" + slotStartZ.toFixed(2), {
        width: lineW, height: 0.03, depth: slotLen
    }, scene);
    left.material = lineMat;
    left.position.set(leftX, yBase + 0.02, slotStartZ + slotLen / 2);
    left.parent = root;

    const right = left.clone(name + "_slotRight_" + rowStartX.toFixed(2) + "_" + slotStartZ.toFixed(2));
    right.position.x = rightX;
    right.parent = root;

    const cap = BABYLON.MeshBuilder.CreateBox(name + "_slotCap_" + rowStartX.toFixed(2) + "_" + slotStartZ.toFixed(2), {
        width: Math.max(0.2, rowEndX - rowStartX - sideInset * 2),
        height: 0.03,
        depth: lineW
    }, scene);
    cap.material = lineMat;
    cap.position.set((leftX + rightX) / 2, yBase + 0.02, slotStartZ + slotLen);
    cap.parent = root;
}

// Açı (angle) parametresi eklenmiş hali
// CarPark_v2.js -> drawSingleSlot fonksiyonunu BUNUNLA DEĞİŞTİR
function drawSingleSlot(scene, root, name, lineMat, barrierMat, x, z, angle, yBase) {
    const slotLen = 3.2;
    const lineW = 0.07;
    const slotWidth = 2.4;
    
    // Slotun tüm parçalarını tutacak bir node
    const slotRoot = new BABYLON.TransformNode(name + "_root", scene);
    slotRoot.position.set(x, yBase + 0.02, z);
    slotRoot.rotation.y = angle; 
    slotRoot.parent = root;

    // --- MANTIK: Tüm çizgiler eşit uzunlukta ve hizalı ---
    // Normalize angle to 0-2PI range for consistent checking
    let normalizedAngle = angle % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    // Check if orthogonal (0, 90, 180, 270 degrees)
    const isOrthogonal = 
        Math.abs(normalizedAngle - Math.PI / 2) < 0.1 || 
        Math.abs(normalizedAngle - 1.5 * Math.PI) < 0.1 ||
        Math.abs(normalizedAngle) < 0.1 ||
        Math.abs(normalizedAngle - Math.PI) < 0.1;

    // --- 1. BEYAZ ÇİZGİLER (ELLEME, AYNEN KALSIN) ---
    
    // Sol Çizgi (Left Line) - Full Length
    const left = BABYLON.MeshBuilder.CreateBox(name + "_left", {
        width: lineW, height: 0.03, depth: slotLen
    }, scene);
    left.material = lineMat;
    left.position.set(-slotWidth / 2, 0, slotLen / 2);
    left.parent = slotRoot;

    // Sağ Çizgi (Right Line) - Full Length, Same Position Z
    const right = BABYLON.MeshBuilder.CreateBox(name + "_right", {
        width: lineW, height: 0.03, depth: slotLen
    }, scene);
    right.material = lineMat;
    right.position.set(slotWidth / 2, 0, slotLen / 2);
    right.parent = slotRoot;

    // Cap is only drawn for orthogonal slots
    if (isOrthogonal) {
        const cap = BABYLON.MeshBuilder.CreateBox(name + "_cap", {
            width: slotWidth, height: 0.03, depth: lineW
        }, scene);
        cap.material = lineMat;
        cap.position.set(0, 0, slotLen);
        cap.parent = slotRoot;
    }

    // --- 2. SARI "U" BARIYER (SADECE CPS LOTS İÇİN, BEYAZLARIN ÜZERİNE OTURUR) ---
    if (barrierMat) {
        const startY = 0.01; // Beyazın (0) hemen üstüne koymak için Z-fighting'i önler
        const startZ = 1.45; // Sarının başladığı nokta
        const barLength = slotLen - startZ; // Sarının uzunluğu (1.75)

        //  SOL DİKEY SARI ÇİZGİ (Z=1.45'ten arka tarafa)
        const barL = BABYLON.MeshBuilder.CreateBox(name + "_barL", {
            width: lineW,       // Beyaz çizgiyle aynı kalınlık
            height: 0.05,       // Fiziksel his için biraz daha yüksek
            depth: barLength
        }, scene);
        barL.material = barrierMat;
        barL.parent = slotRoot;
        barL.position.set(-slotWidth / 2, startY, startZ + (barLength / 2));

        // 🟡 SAĞ DİKEY SARI ÇİZGİ (Z=1.45'ten arka tarafa)
        const barR = BABYLON.MeshBuilder.CreateBox(name + "_barR", {
            width: lineW,
            height: 0.05,
            depth: barLength
        }, scene);
        barR.material = barrierMat;
        barR.parent = slotRoot;
        barR.position.set(slotWidth / 2, startY, startZ + (barLength / 2));

        // 🟡 ARKA YATAY SARI ÇİZGİ (Slotun en arkasını kapatır)
        const barBack = BABYLON.MeshBuilder.CreateBox(name + "_barBack", {
            width: slotWidth,   // İki yan çizgi arası mesafe
            height: 0.05,
            depth: lineW
        }, scene);
        barBack.material = barrierMat;
        barBack.parent = slotRoot;
        barBack.position.set(0, startY, slotLen);
    }
}

// Açı (angle) parametresi eklenmiş hali
// function drawSingleSlot(scene, root, name, lineMat, x, z, angle, yBase) {
//     const slotLen = 3.2;
//     const lineW = 0.07;
//     const slotWidth = 2.4; 
    
//     // Slotun tüm parçalarını tutacak bir node
//     const slotRoot = new BABYLON.TransformNode(name + "_root", scene);
//     slotRoot.position.set(x, yBase + 0.02, z);
//     slotRoot.rotation.y = angle; 
//     slotRoot.parent = root;

//     // --- MANTIK: Tüm çizgiler eşit uzunlukta ve hizalı ---
//     // Normalize angle to 0-2PI range for consistent checking
//     let normalizedAngle = angle % (2 * Math.PI);
//     if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

//     // Check if orthogonal (0, 90, 180, 270 degrees)
//     const isOrthogonal = 
//         Math.abs(normalizedAngle - Math.PI / 2) < 0.1 || 
//         Math.abs(normalizedAngle - 1.5 * Math.PI) < 0.1 ||
//         Math.abs(normalizedAngle) < 0.1 ||
//         Math.abs(normalizedAngle - Math.PI) < 0.1;

//     // Sol Çizgi (Left Line) - Full Length
//     const left = BABYLON.MeshBuilder.CreateBox(name + "_left", {
//         width: lineW, height: 0.03, depth: slotLen
//     }, scene);
//     left.material = lineMat;
//     left.position.set(-slotWidth / 2, 0, slotLen / 2);
//     left.parent = slotRoot;

//     // Sağ Çizgi (Right Line) - Full Length, Same Position Z
//     const right = BABYLON.MeshBuilder.CreateBox(name + "_right", {
//         width: lineW, height: 0.03, depth: slotLen
//     }, scene);
//     right.material = lineMat;
//     right.position.set(slotWidth / 2, 0, slotLen / 2);
//     right.parent = slotRoot;

//     // Cap is only drawn for orthogonal slots
//     if (isOrthogonal) {
//         const cap = BABYLON.MeshBuilder.CreateBox(name + "_cap", {
//             width: slotWidth, height: 0.03, depth: lineW
//         }, scene);
//         cap.material = lineMat;
//         cap.position.set(0, 0, slotLen);
//         cap.parent = slotRoot;
//     }
// }

function buildSlotsInClearSegments(scene, root, name, lineMat, rowStartX, rowEndX, zFrom, zTo, connectors, connectorDepth, yBase) {
    const slotPitch = 2.8;
    const segmentPadding = 0.35;

    const segmentBounds = [];
    let segStart = zFrom;
    for (const cz of connectors) {
        const segEnd = cz - connectorDepth / 2;
        if (segEnd > segStart + SLOT_LENGTH + segmentPadding * 2) {
            segmentBounds.push([segStart, segEnd]);
        }
        segStart = cz + connectorDepth / 2;
    }
    if (zTo > segStart + SLOT_LENGTH + segmentPadding * 2) {
        segmentBounds.push([segStart, zTo]);
    }

    for (const [rawStart, rawEnd] of segmentBounds) {
        const start = rawStart + segmentPadding;
        const end = rawEnd - segmentPadding;
        const usable = end - start;
        const count = Math.floor((usable - SLOT_LENGTH) / slotPitch) + 1;
        if (count <= 0) continue;
        for (let i = 0; i < count; i++) {
            const slotStartZ = start + i * slotPitch;
            if (slotStartZ + SLOT_LENGTH > end + 0.0001) break;
            drawFullSlot(scene, root, name, lineMat, rowStartX, rowEndX, slotStartZ, SLOT_LENGTH, yBase);
        }
    }
}

function addPerimeterWalls(scene, root, name, x, centerZ, width, length, yBase, options) {
    const wallMat = createMaterial(scene, name + "_wallMat", new BABYLON.Color3(0.55, 0.55, 0.58));
    const wallHeight = options.wallHeight ?? 1.4;
    const wallThickness = options.wallThickness ?? 0.25;
    const edgeInset = 0.1;

    const xMin = x - width / 2 + edgeInset;
    const xMax = x + width / 2 - edgeInset;
    const zMin = centerZ - length / 2 + edgeInset;
    const zMax = centerZ + length / 2 - edgeInset;

    const left = BABYLON.MeshBuilder.CreateBox(name + "_wallLeft", {
        width: wallThickness, height: wallHeight, depth: length - edgeInset * 2
    }, scene);
    left.material = wallMat;
    left.position.set(xMin, yBase + wallHeight / 2, centerZ);
    left.parent = root;

    const right = left.clone(name + "_wallRight");
    right.position.x = xMax;
    right.parent = root;

    // Entrance side changes by variant so each map area feels different.
    if (options.entranceSide === "north") {
        const back = BABYLON.MeshBuilder.CreateBox(name + "_wallSouth", {
            width: width - edgeInset * 2, height: wallHeight, depth: wallThickness
        }, scene);
        back.material = wallMat;
        back.position.set(x, yBase + wallHeight / 2, zMin);
        back.parent = root;

        const frontSpan = (width - options.entranceWidth) / 2;
        const frontLeft = BABYLON.MeshBuilder.CreateBox(name + "_wallNorthL", {
            width: frontSpan, height: wallHeight, depth: wallThickness
        }, scene);
        frontLeft.material = wallMat;
        frontLeft.position.set(x - (options.entranceWidth / 2 + frontSpan / 2), yBase + wallHeight / 2, zMax);
        frontLeft.parent = root;

        const frontRight = frontLeft.clone(name + "_wallNorthR");
        frontRight.position.x = x + (options.entranceWidth / 2 + frontSpan / 2);
        frontRight.parent = root;
    } else {
        const front = BABYLON.MeshBuilder.CreateBox(name + "_wallNorth", {
            width: width - edgeInset * 2, height: wallHeight, depth: wallThickness
        }, scene);
        front.material = wallMat;
        front.position.set(x, yBase + wallHeight / 2, zMax);
        front.parent = root;

        const backSpan = (width - options.entranceWidth) / 2;
        const backLeft = BABYLON.MeshBuilder.CreateBox(name + "_wallSouthL", {
            width: backSpan, height: wallHeight, depth: wallThickness
        }, scene);
        backLeft.material = wallMat;
        backLeft.position.set(x - (options.entranceWidth / 2 + backSpan / 2), yBase + wallHeight / 2, zMin);
        backLeft.parent = root;

        const backRight = backLeft.clone(name + "_wallSouthR");
        backRight.position.x = x + (options.entranceWidth / 2 + backSpan / 2);
        backRight.parent = root;
    }
}

function addVariedParking(scene, root, name, x, startZ, endZ, yBase, width) {
    // Empty - no varied slots for now
}

function addPerpendicularSlots(scene, root, name, x, startZ, endZ, yBase, width) {
    // Empty - no parking slot lines
}

export function createCarPark(scene, options = {}) {
    const {
        name = "CarPark",
        x = 0,
        startZ = -5,
        endZ = 5,
        width = 25,
        y = -0.22,
        variant = "perpendicular",
        variedSlots = false
    } = options;

    const lotLength = Math.max(4, Math.abs(endZ - startZ));
    const centerZ = (startZ + endZ) / 2;
    const root = new BABYLON.TransformNode(name + "_root", scene);

    // Main slab gives the lot some volume instead of a flat placeholder plane.
    const slab = BABYLON.MeshBuilder.CreateBox(name + "_slab", {
        width,
        height: 0.22,
        depth: lotLength
    }, scene);
    slab.material = createMaterial(scene, name + "_asphaltMat", new BABYLON.Color3(0.2, 0.2, 0.22));
    slab.position.set(x, y + 0.11, centerZ);
    slab.parent = root;

    const curb = BABYLON.MeshBuilder.CreateBox(name + "_curb", {
        width: width - 0.4,
        height: 0.04,
        depth: lotLength - 0.4
    }, scene);
    // Keep border close to asphalt tone so lot edges don't look unnaturally bright.
    curb.material = createMaterial(scene, name + "_curbMat", new BABYLON.Color3(0.19, 0.19, 0.21));
    curb.position.set(x, y + 0.20, centerZ);
    curb.parent = root;

    const asphaltTop = BABYLON.MeshBuilder.CreateGround(name + "_surface", {
        width: width - 0.45,
        height: lotLength - 0.45
    }, scene);
    asphaltTop.material = createMaterial(scene, name + "_surfaceMat", new BABYLON.Color3(0.15, 0.15, 0.16));
    asphaltTop.position.set(x, y + 0.231, centerZ);
    asphaltTop.parent = root;

    if (variant === "angled") {
        addPerimeterWalls(scene, root, name, x, centerZ, width, lotLength, y + 0.22, {
            entranceSide: "south",
            entranceWidth: 3.3
        });
    } else {
        addPerimeterWalls(scene, root, name, x, centerZ, width, lotLength, y + 0.22, {
        entranceSide: "north",
        entranceWidth: 4.0
    });
        if (variedSlots) {
            addVariedParking(scene, root, name, x, startZ, endZ, y + 0.22, width);
            console.log(`[${name}] Varied parking layout rendered`);
        } else {
            addPerpendicularSlots(scene, root, name, x, startZ, endZ, y + 0.22, width);
        }
        console.log(`[${name}] Parking lot entrance rendered: side="north", centerX=${x}, entranceZ=${Math.max(startZ, endZ)}, width=4.0`);
    }

    if (options.customSlots) {
        const lineMat = createMaterial(scene, name + "_customLineMat", new BABYLON.Color3(0.94, 0.94, 0.94));
        
        //  CPS DETECTION: Only create barrier material if lot name contains "_CFS"
        const barrierMat = name.includes("_CFS") 
            ? createMaterial(scene, name + "_barrierMat", new BABYLON.Color3(1.0, 0.85, 0.0)) 
            : null;

        options.customSlots.forEach((s, index) => {
            drawSingleSlot(
                scene, 
                root, 
                `${name}_custom_${index}`, 
                lineMat, 
                barrierMat, // 👈 Yeni parametre buraya eklendi
                s.x, 
                s.z, 
                s.angle || 0, 
                y + 0.22
            );
        });
    }
    return root;
}
