export default class Car {
    constructor(scene, color = new BABYLON.Color3(1, 0.8, 0), scale = 1, options = {}) {
        this.scene = scene;
        this.scale = scale;
        this.root = new BABYLON.TransformNode("car_root", scene);
        
        this.root.scaling.set(scale, scale, scale);

        // Randomly choose bodystyle if not specified
        this.bodystyle = options.bodystyle || ['sedan', 'hatchback', 'stationwagon'][Math.floor(Math.random() * 3)];

        // Materyaller
        this.bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
        this.bodyMat.diffuseColor = color;
        
        this.wheelMat = new BABYLON.StandardMaterial("wheelMat", scene);
        this.wheelMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Siyah
        
        this.createBody();
        this.addWheels();
        this.addWindows();

        this.maxSpeed = 0.15;      // Normal seyir hızı
        this.currentSpeed = 0;     // O anki anlık hız (0'dan başlayacak)
        this.targetSpeed = 0.15;   // Ulaşmak istediği hız
        this.acceleration = 0.01;
        this.isActive = true;
        this.patience = 500 + Math.random() * 500; // Her arabanın sabrı farklı olsun
        this.waitCounter = 0;
        this.exitingCarPark = false;
        this.willExitCarPark = false;

        this.parkDuration = 0;
        this.exitTargetPoint = null;

        this.roadNetwork = options.roadNetwork ?? null;
        this.roadType = options.roadType ?? "MAIN"; // MAIN | SIDE
        this.sideRoad = options.sideRoad ?? null;   // { z, side, length } when on SIDE
        this.mainFlow = options.mainFlow ?? "DOWN"; // DOWN (-Z) | UP (+Z)

        this.parkingEntrances = this.roadNetwork?.renderedParkingEntrances || this.roadNetwork?.parkingEntrances || [];
        this.hasDetectedEntrance = false;

        this.allCustomSlots = [];
        this.allCoordPoints = [];
        this.currentLotId = null;

        if (this.roadNetwork?.BIG_LOT_CUSTOM_SLOTS) {
            this.allCustomSlots = [...this.allCustomSlots, ...this.roadNetwork.BIG_LOT_CUSTOM_SLOTS.map(s => ({...s, lotId: 'big'}))];
        }
        if (this.roadNetwork?.SMALL_LOT_CUSTOM_SLOTS) {
            this.allCustomSlots = [...this.allCustomSlots, ...this.roadNetwork.SMALL_LOT_CUSTOM_SLOTS.map(s => ({...s, lotId: 'small'}))];
        }

        if (this.roadNetwork?.BIG_PARKING_COORD_POINTS) {
            this.allCoordPoints = [...this.allCoordPoints, ...this.roadNetwork.BIG_PARKING_COORD_POINTS.map(p => ({...p, lotId: 'big'}))];
        }
        if (this.roadNetwork?.SMALL_PARKING_COORD_POINTS) {
            this.allCoordPoints = [...this.allCoordPoints, ...this.roadNetwork.SMALL_PARKING_COORD_POINTS.map(p => ({...p, lotId: 'small'}))];
        }

        // Use aggregated lists for general operations
        this.coordPoints = this.allCoordPoints; 
        this.customSlots = this.allCustomSlots;

        // BIG_PARKING_COORD_POINTS support
        // this.coordPoints = this.roadNetwork?.BIG_PARKING_COORD_POINTS || [];
        this.selectedCoordTarget = null;
        this.hasDecidedToPark = false;
        this.targetParkingSlot = null;
        this.isParking = false;
        this.exitPathQueue = [];
        this.parkingPhase = 'APPROACH';

        this.lastJunctionPassed = null;           // Aynı kavşakta 50 kere karar vermesin diye
        this.currentIntent = "STRAIGHT";          // STRAIGHT | TURN_TO_SIDE | TURN_TO_MAIN

        this.state = "DRIVING"; // DRIVING, TURNING
        this.turnTargetAngle = 0; // Dönüş bittiğinde olması gereken açı
        this.turnProgress = 0; // 0'dan 1'e kadar dönüş ilerlemesi
        this.turnDirection = 1;

        this.turnData = null; // turn path + rotation data (start/end positions and target angle)
        this.state = 'DRIVING';
        this.isBadPark = false;
    }

    createBody() {
        let carShape;

        if (this.bodystyle === 'sedan') {
            // En sade sedan profili (Mavi araba/ikinci resim tarzı)
            carShape = [
                new BABYLON.Vector3(-2.2, 0, 0),    // Ön alt
                new BABYLON.Vector3(2.2, 0, 0),     // Arka alt
                new BABYLON.Vector3(2.2, 0.5, 0),   // Arka tampon
                new BABYLON.Vector3(1.4, 0.6, 0),   // Bagaj başlangıcı
                new BABYLON.Vector3(1.0, 1.1, 0),   // Arka cam üstü
                new BABYLON.Vector3(-0.4, 1.1, 0),  // Ön cam üstü
                new BABYLON.Vector3(-0.9, 0.6, 0),  // Kaput başlangıcı
                new BABYLON.Vector3(-2.2, 0.5, 0),  // Ön tampon
                new BABYLON.Vector3(-2.2, 0, 0)     // Kapatış
            ];
        } else if (this.bodystyle === 'hatchback') {
            // Hatchback: Kısa arka, dik bagaj
            carShape = [
                new BABYLON.Vector3(-2.2, 0, 0),    // Ön alt
                new BABYLON.Vector3(1.8, 0, 0),     // Arka alt (kısaltılmış)
                new BABYLON.Vector3(1.8, 0.5, 0),   // Arka tampon
                new BABYLON.Vector3(1.2, 1.0, 0),   // Hatch başlangıcı
                new BABYLON.Vector3(0.8, 1.1, 0),   // Arka cam üstü
                new BABYLON.Vector3(-0.4, 1.1, 0),  // Ön cam üstü
                new BABYLON.Vector3(-0.9, 0.6, 0),  // Kaput başlangıcı
                new BABYLON.Vector3(-2.2, 0.5, 0),  // Ön tampon
                new BABYLON.Vector3(-2.2, 0, 0)     // Kapatış
            ];
        } else if (this.bodystyle === 'stationwagon') {
            // Station wagon: Longer hatchback style
            carShape = [
                new BABYLON.Vector3(-2.2, 0, 0),    // Ön alt
                new BABYLON.Vector3(2.2, 0, 0),     // Arka alt (uzatılmış)
                new BABYLON.Vector3(2.2, 0.5, 0),   // Arka tampon
                new BABYLON.Vector3(1.6, 1.0, 0),   // Hatch başlangıcı
                new BABYLON.Vector3(1.2, 1.1, 0),   // Arka cam üstü
                new BABYLON.Vector3(-0.4, 1.1, 0),  // Ön cam üstü
                new BABYLON.Vector3(-0.9, 0.6, 0),  // Kaput başlangıcı
                new BABYLON.Vector3(-2.2, 0.5, 0),  // Ön tampon
                new BABYLON.Vector3(-2.2, 0, 0)     // Kapatış
            ];
        }

        const carMesh = BABYLON.MeshBuilder.ExtrudeShape("car_body", {
            shape: carShape,
            path: [new BABYLON.Vector3(0, 0, -0.9), new BABYLON.Vector3(0, 0, 0.9)], // Genişlik: 1.8
            cap: BABYLON.Mesh.CAP_ALL
        }, this.scene);

        carMesh.convertToFlatShadedMesh();
        carMesh.material = this.bodyMat;
        carMesh.parent = this.root;
    }

    addWheels() {
        let wheelData;

        if (this.bodystyle === 'sedan') {
            wheelData = [
                { x: -1.4, z: 0.9 },  // Ön Sağ
                { x: -1.4, z: -0.9 }, // Ön Sol
                { x: 1.4, z: 0.9 },   // Arka Sağ
                { x: 1.4, z: -0.9 }   // Arka Sol
            ];
        } else if (this.bodystyle === 'hatchback') {
            // Kısa arka için arka tekerlekleri öne çek
            wheelData = [
                { x: -1.4, z: 0.9 },  // Ön Sağ
                { x: -1.4, z: -0.9 }, // Ön Sol
                { x: 1.0, z: 0.9 },   // Arka Sağ (öne çekildi)
                { x: 1.0, z: -0.9 }   // Arka Sol
            ];
        } else if (this.bodystyle === 'stationwagon') {
            // Uzun arka için arka tekerlekleri geriye çek
            wheelData = [
                { x: -1.4, z: 0.9 },  // Ön Sağ
                { x: -1.4, z: -0.9 }, // Ön Sol
                { x: 1.8, z: 0.9 },   // Arka Sağ (geriye çekildi)
                { x: 1.8, z: -0.9 }   // Arka Sol
            ];
        }

        wheelData.forEach((pos, index) => {
            const wheel = BABYLON.MeshBuilder.CreateCylinder("wheel_" + index, {
                diameter: 0.7,
                height: 0.4,
                tessellation: 12 // Hafif köşeli, retro durması için
            }, this.scene);

            wheel.material = this.wheelMat;
            wheel.parent = this.root;

            // Tekerleği yan yatır ve konumlandır
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(pos.x, 0.1, pos.z);
        });
    }

    addWindows() {
        let positions;

        if (this.bodystyle === 'sedan') {
            positions = [
                // --- ÖN CAM (0, 1, 2, 3) ---
                -0.88, 0.62,  0.88,  // 0: Sol Alt
                -0.39, 1.12,  0.88,  // 1: Sol Üst
                -0.39, 1.12, -0.88,  // 2: Sağ Üst
                -0.88, 0.62, -0.88,  // 3: Sağ Alt

                // --- SAĞ YAN CAM (4, 5, 6, 7) ---
                -0.67, 0.62,  0.91,  
                -0.37, 1.08,  0.91,  
                0.95, 1.08,  0.91,  
                1.10, 0.62,  0.91,  

                // --- SOL YAN CAM (8, 9, 10, 11) ---
                -0.67, 0.62, -0.91,  
                -0.37, 1.08, -0.91,  
                0.95, 1.08, -0.91,  
                1.10, 0.62, -0.91,

                // --- ARKA CAM (12, 13, 14, 15) ---
                1.41, 0.61,  0.88,   // 12: Sol Alt
                1.01, 1.11,  0.88,   // 13: Sol Üst
                1.01, 1.11, -0.88,   // 14: Sağ Üst
                1.41, 0.61, -0.88    // 15: Sağ Alt
            ];
        } else if (this.bodystyle === 'hatchback') {
            positions = [
                // --- ÖN CAM (0, 1, 2, 3) ---
                -0.88, 0.62,  0.88,  // 0: Sol Alt
                -0.39, 1.12,  0.88,  // 1: Sol Üst
                -0.39, 1.12, -0.88,  // 2: Sağ Üst
                -0.88, 0.62, -0.88,  // 3: Sağ Alt

                // --- SAĞ YAN CAM (4, 5, 6, 7) ---
                -0.67, 0.62,  0.91,  
                -0.37, 1.08,  0.91,  
                0.75, 1.08,  0.91,  
                0.90, 0.62,  0.91,  

                // --- SOL YAN CAM (8, 9, 10, 11) ---
                -0.67, 0.62, -0.91,  
                -0.37, 1.08, -0.91,  
                0.75, 1.08, -0.91,  
                0.90, 0.62, -0.91,

                // --- ARKA CAM (12, 13, 14, 15) ---
                1.21, 0.61,  0.88,   // 12: Sol Alt (öne çekildi)
                0.81, 1.11,  0.88,   // 13: Sol Üst
                0.81, 1.11, -0.88,   // 14: Sağ Üst
                1.21, 0.61, -0.88    // 15: Sağ Alt
            ];
        } else if (this.bodystyle === 'stationwagon') {
            positions = [
                // --- ÖN CAM (0, 1, 2, 3) ---
                -0.88, 0.62,  0.88,  // 0: Sol Alt
                -0.39, 1.12,  0.88,  // 1: Sol Üst
                -0.39, 1.12, -0.88,  // 2: Sağ Üst
                -0.88, 0.62, -0.88,  // 3: Sağ Alt

                // --- SAĞ YAN CAM (4, 5, 6, 7) ---
                -0.67, 0.62,  0.91,  
                -0.37, 1.08,  0.91,  
                1.75, 1.08,  0.91,  
                1.90, 0.62,  0.91,  

                // --- SOL YAN CAM (8, 9, 10, 11) ---
                -0.67, 0.62, -0.91,  
                -0.37, 1.08, -0.91,  
                1.75, 1.08, -0.91,  
                1.90, 0.62, -0.91,

                // --- ARKA CAM (12, 13, 14, 15) ---
                2.21, 0.61,  0.88,   // 12: Sol Alt (geriye çekildi)
                1.81, 1.11,  0.88,   // 13: Sol Üst
                1.81, 1.11, -0.88,   // 14: Sağ Üst
                2.21, 0.61, -0.88    // 15: Sağ Alt
            ];
        }

        const indices = [
            // ÖN CAM
            0, 1, 2, 0, 2, 3,
            // SAĞ YAN
            4, 5, 6, 4, 6, 7,
            // SOL YAN
            8, 10, 9, 8, 11, 10,
            // ARKA CAM (Dışa bakması için sıralama)
            12, 14, 13, 12, 15, 14
        ];

        // ... (Geri kalan VertexData ve material kodları aynı kalacak)
        
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;

        const windowMesh = new BABYLON.Mesh("car_windows", this.scene);
        vertexData.applyToMesh(windowMesh);
        
        const windowMat = new BABYLON.StandardMaterial("winMat", this.scene);
        windowMat.diffuseColor = new BABYLON.Color3(0.02, 0.02, 0.02);
        windowMat.backFaceCulling = false; 
        windowMesh.material = windowMat;
        windowMesh.parent = this.root;
        windowMesh.convertToFlatShadedMesh();
    }

    setPosition(x, y, z) {
        this.root.position.set(x, y, z);
    }

    getForward() {
        const angle = this.root.rotation.y - (Math.PI / 2);
        return { x: Math.sin(angle), z: Math.cos(angle) };
    }

    getMainLaneX() {
        return (this.mainFlow === "UP") ? 1.0 : -1.0;
    }

    getSideRoadRightLaneZ(sideRoad) {
        if (!sideRoad) return this.root.position.z;
        return (sideRoad.side === "left") ? (sideRoad.z + 1.0) : (sideRoad.z - 1.0);
    }

    getSideRoadJunctionX(sideRoad) {
        const roadHalf = (this.roadNetwork?.main?.width ?? 5) / 2;
        return (sideRoad?.side === "left") ? -roadHalf : roadHalf;
    }

    normalizeAngle(rad) {
        const twoPi = Math.PI * 2;
        let a = rad % twoPi;
        if (a < 0) a += twoPi;
        return a;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    quadraticBezier(t, p0, p1, p2) {
        const u = 1 - t;
        return p0.scale(u * u).add(p1.scale(2 * u * t)).add(p2.scale(t * t));
    }

    shortestAngleDelta(from, to) {
        const twoPi = Math.PI * 2;
        const a = this.normalizeAngle(from);
        const b = this.normalizeAngle(to);
        let d = (b - a) % twoPi;
        if (d > Math.PI) d -= twoPi;
        if (d < -Math.PI) d += twoPi;
        return d;
    }

    // Car_V4.js içindeki findCarInFront(allCars) metodunu BUNUNLA DEĞİŞTİR:
    findCarInFront(allCars) {
        const myPos = this.root.position;
        const fwd = this.getForward();
        const fwdX = fwd.x;
        const fwdZ = fwd.z;
        
        let closestCar = null;
        let closestDist = Infinity;
        const searchRadius = 18 * this.scale; // Sadece önündeki ~18 birimi tara
        const laneThreshold = 2.0 * this.scale; // Şerit genişliği toleransı

        for (let i = 0; i < allCars.length; i++) {
            const other = allCars[i];
            if (!other || other === this || !other.isActive) continue;

            const oPos = other.root.position;
            const rx = oPos.x - myPos.x;
            const rz = oPos.z - myPos.z;

            // İleri mesafe projeksiyonu
            const forwardDist = rx * fwdX + rz * fwdZ;
            if (forwardDist <= 0 || forwardDist > searchRadius) continue;

            // Yanal mesafe (Aynı şeritte mi?)
            const lateralDist = Math.abs(rx * (-fwdZ) + rz * fwdX);
            if (lateralDist > laneThreshold) continue;

            if (forwardDist < closestDist) {
                closestDist = forwardDist;
                closestCar = other;
                
                // 🚀 ERKEN ÇIKIŞ: Eğer önünde güvenli mesafede araba bulduysan taramayı bırak
                if (closestDist < 4.0) break;
            }
        }

        return closestCar ? { car: closestCar, dist: closestDist } : null;
    }

    // findCarInFront(allCars) {
    //     const myPos = this.root.position;
    //     const fwd = this.getForward();

    //     let best = null;
    //     let bestDist = Infinity;

    //     for (const other of allCars) {
    //         if (!other || other === this || !other.isActive) continue;
    //         const oPos = other.root.position;

    //         const rx = oPos.x - myPos.x;
    //         const rz = oPos.z - myPos.z;

    //         // Projection on forward axis
    //         const forwardDist = rx * fwd.x + rz * fwd.z;
    //         if (forwardDist <= 0) continue;

    //         // Lateral distance to our direction
    //         const lateralDist = Math.abs(rx * (-fwd.z) + rz * fwd.x);

    //         // Heuristic lane width threshold
    //         const laneThreshold = 2.0 * this.scale;
    //         if (lateralDist > laneThreshold) continue;

    //         if (forwardDist < bestDist) {
    //             bestDist = forwardDist;
    //             best = { car: other, dist: forwardDist };
    //         }
    //     }

    //     return best;
    // }

    getJunctionForZ(junctionZ) {
        if (!this.roadNetwork?.sideRoads) return null;
        return this.roadNetwork.sideRoads.find(sr => sr.z === junctionZ) ?? null;
    }


    moveTowardPoint(point, topSpeed = 0.07) {
        const currentPos = this.root.position;
        const toTarget = point.subtract(currentPos);
        const planar = new BABYLON.Vector3(toTarget.x, 0, toTarget.z);
        const distance = planar.length();
        if (distance < 0.0001) return distance;

        const desiredAngle = Math.atan2(planar.x, planar.z);
        const angleDelta = this.shortestAngleDelta(this.root.rotation.y, desiredAngle);
        const turnStep = Math.max(-0.035, Math.min(0.035, angleDelta));
        this.root.rotation.y = this.normalizeAngle(this.root.rotation.y + turnStep);

        const headingFactor = Math.max(0.25, 1 - Math.min(1, Math.abs(angleDelta) / 1.2));
        const stoppingFactor = Math.max(0.2, Math.min(1, distance / 3.0));
        this.targetSpeed = Math.min(topSpeed, this.maxSpeed * 0.55) * headingFactor * stoppingFactor;
        if (this.currentSpeed < this.targetSpeed) {
            this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, this.targetSpeed);
        } else {
            this.currentSpeed = Math.max(this.currentSpeed - this.acceleration * 1.6, this.targetSpeed);
        }

        const fwd = this.getForward();
        this.root.position.x += fwd.x * this.currentSpeed;
        this.root.position.z += fwd.z * this.currentSpeed;
        return distance;
    }

    makeDecisionAtJunction(junctionZ) {
        // If we are coming from a side road, always merge into main road.
        if (this.roadType === "SIDE") {
            this.currentIntent = "TURN_TO_MAIN";
            this.targetJunctionZ = junctionZ;

            const targetAngle = (this.mainFlow === "UP") ? (Math.PI / 2) : (Math.PI * 1.5);
            const targetX = this.getMainLaneX();
            const targetZ = this.sideRoad?.z ?? junctionZ;

            this.turnData = {
                startPos: this.root.position.clone(),
                endPos: new BABYLON.Vector3(targetX, this.root.position.y, targetZ),
                startAngle: this.root.rotation.y,
                targetAngle,
                progress: 0.0
            };

            this.lastJunctionPassed = junctionZ;
            return;
        }

        // On main road: mostly go straight, sometimes turn into a side road.
        const rand = Math.random();
        const sideRoad = this.getJunctionForZ(junctionZ);
        if (!sideRoad || rand < 0.7) {
            this.currentIntent = "STRAIGHT";
            this.lastJunctionPassed = junctionZ;
            return;
        }

        this.currentIntent = "TURN_TO_SIDE";
        this.targetJunctionZ = junctionZ;
        this.sideRoad = sideRoad;

        const targetAngle = (sideRoad.side === "left") ? 0 : Math.PI;
        const targetX = this.getSideRoadJunctionX(sideRoad);
        const targetZ = this.getSideRoadRightLaneZ(sideRoad);

        const startPos = this.root.position.clone();
        const startDir = new BABYLON.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
        const delta = this.shortestAngleDelta(this.root.rotation.y, targetAngle);
        const turnDir = delta > 0 ? 1 : -1;
        const lateralVec = new BABYLON.Vector3(-startDir.z * turnDir, 0, startDir.x * turnDir);
        const control = startPos.add(startDir.scale(1.5)).add(lateralVec.scale(1.5));

        this.turnData = {
            startPos,
            control,
            endPos: new BABYLON.Vector3(targetX, this.root.position.y, targetZ),
            startAngle: this.root.rotation.y,
            targetAngle,
            progress: 0.0
        };

        this.lastJunctionPassed = junctionZ;
    }

    // Car_V3.js

checkNearbyParkingSlots(allCars = []) {
    // Allow parking if not exiting, slots exist, and driving straight
    if (this.exitingCarPark || !this.customSlots || this.currentIntent !== "STRAIGHT") return;

    const detectionRange = 4.0;
    const parkChance = 0.005; // Adjust as needed
    const occupancyRange = 2.2; 
    const myPos = this.root.position;

    for (let i = 0; i < this.customSlots.length; i++) {
        const slot = this.customSlots[i];
        const dx = myPos.x - slot.x;
        const dz = myPos.z - slot.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < detectionRange) {
            // Check occupancy
            const isOccupied = allCars.some(other => {
                if (!other || other === this) return false;
                const ox = other.root.position.x - slot.x;
                const oz = other.root.position.z - slot.z;
                const slotDist = Math.sqrt(ox * ox + oz * oz);

                if (slotDist < occupancyRange) {
                    return !other.isActive || 
                        other.isParking || 
                        other.targetParkingSlot === slot ||
                        other.currentSpeed < 0.02;
                }
                return false;
            });

            if (isOccupied) continue;

            // Decide to park
            if (Math.random() < parkChance) {
                //console.log(`🅿️ [PARK DECISION] Car decided to park in ${slot.lotId} lot at slot index ${i}`);
                
                this.currentLotId = slot.lotId; // Remember which lot we entered
                if (slot.hasBarrier) {
                    this.isBadPark = false;
                } else {
                    this.isBadPark = Math.random() < 0.25; // Normal slotlarda %25 ihtimalle çapraz park
                } // 25% chance of bad park

                // Bad Park Logic (Check neighbors only if they exist in the same lot structure ideally, 
                // but for simplicity we skip complex neighbor checks across merged arrays unless indexed properly)
                // For now, keep simple random bad park.

                let angleOffset = 0;
                let posOffset = new BABYLON.Vector3(0, 0, 0);

                if (this.isBadPark) {
                    const angleDeg = (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 10);
                    angleOffset = angleDeg * (Math.PI / 180);
                    const offsetDist = 1.0 + Math.random() * 0.5;
                    const slotForward = new BABYLON.Vector3(Math.sin(slot.angle), 0, Math.cos(slot.angle));
                    const slotRight = new BABYLON.Vector3(slotForward.z, 0, -slotForward.x);
                    posOffset = slotRight.scale(offsetDist * (Math.random() < 0.5 ? 1 : -1));
                }

                this.targetParkingSlot = slot;
                this.isParking = true;
                this.currentIntent = "TURN_TO_SLOT";

                const startPos = myPos.clone();

// YENİ KOD (YAPIŞTIR):
// Slot açısını normalize et (0-π arası)
const slotAngleMod = slot.angle % Math.PI;

// Dik (perpendicular) mi yoksa açılı (angled) mi?
// 0 veya ~1.57 (π/2) ise dik, diğerleri açılı
const isPerpendicular = 
    Math.abs(slotAngleMod) < 0.1 ||                    // 0 rad (180°)
    Math.abs(slotAngleMod - 0.5 * Math.PI) < 0.15 ||   // 1.57 rad (90°)
    Math.abs(slotAngleMod - Math.PI) < 0.1;            // 3.14 rad (180°)

// Ters park kararı (25% ihtimal - sadece düz parklarda)
const shouldParkReverse = !this.isBadPark && Math.random() < 0.25;

let targetAngle;

if (isPerpendicular) {
    // Dik slot: Normalde +90° ekleriz
    // Ama ters park edecekse açıyı 180° çevir
    if (shouldParkReverse) {
        targetAngle = slot.angle + (1.5 * Math.PI) + angleOffset; // +270° = ters yön
    } else {
        targetAngle = slot.angle + (0.5 * Math.PI) + angleOffset; // +90° = normal yön
    }
} else {
    // Açılı slot: Slot açısıyla aynı yönde park et
    // Ters park açılı slotlarda zor olduğu için devre dışı
    targetAngle = slot.angle + (0.5 * Math.PI) + angleOffset;
}

// Ters park için log (opsiyonel)
if (shouldParkReverse && isPerpendicular) {
    //console.log(`🅿️ [REVERSE PARK] Car will park in reverse at slot (${slot.x}, ${slot.z})`);
}

                const startDir = new BABYLON.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
                const delta = this.shortestAngleDelta(this.root.rotation.y, targetAngle);
                const turnDir = delta > 0 ? 1 : -1;
                const lateralVec = new BABYLON.Vector3(-startDir.z * turnDir, 0, startDir.x * turnDir);
                const control = startPos.add(startDir.scale(2.0)).add(lateralVec.scale(1.5));

                const forwardOffset = 1.5;
                const slotForward = new BABYLON.Vector3(Math.sin(slot.angle), 0, Math.cos(slot.angle));
                const endPos = new BABYLON.Vector3(
                    slot.x + slotForward.x * forwardOffset + posOffset.x,
                    myPos.y,
                    slot.z + slotForward.z * forwardOffset + posOffset.z
                );

                this.turnData = {
                    startPos, control, endPos,
                    startAngle: this.root.rotation.y,
                    targetAngle,
                    progress: 0.0
                };
                return; 
            }
        }
    }
}

    update(allCars = []) {
        if (!this.isActive) {
            this.parkDuration++; // Count how long we've been parked
            
            // Wake up after random time (1000 to 2000 frames)
            // 60 frames = ~1 second. So this is roughly 15-30 seconds.
            if (this.parkDuration > 10000 + Math.random() * 5000) {
                this.exitingCarPark = true;
                this.isActive = true;

                const backwardDistance = 3;
                const angle = this.root.rotation.y;

                const offsetX = Math.sin(angle + 0.5 * Math.PI) * backwardDistance;
                const offsetZ = Math.cos(angle + 0.5 * Math.PI) * backwardDistance;

                this.exitTargetPoint = new BABYLON.Vector3(
                    this.root.position.x + offsetX,
                    this.root.position.y,
                    this.root.position.z + offsetZ
                );

                //console.log(`⏰ [WAKE UP] Car at (${this.root.position.x.toFixed(1)}, ${this.root.position.z.toFixed(1)}) decided to leave.`);
                //console.log(`📍 [EXIT POINT] Calculated backing point: X=${this.exitTargetPoint.x.toFixed(1)}, Z=${this.exitTargetPoint.z.toFixed(1)} (Angle: ${angle.toFixed(2)})`);

                this.parkDuration = 0;

                const nearestCoord = this.findNearestCoordPoint();
                //console.log("[DEBUG] nearestCoord: ", nearestCoord);
                let targetPos = this.exitTargetPoint; // Default: face the backward point
                let targetAngle = this.root.rotation.y;

                if (nearestCoord && nearestCoord.point) {
                    const turnTo = nearestCoord.point.turnTo || [];
                    
                    // 1. FİZİKSEL HEDEF: En yakın noktanın kendisi (Araba buraya doğru sürecek)
                    const physicalTarget = nearestCoord.point.position;
                    
                    // 2. AÇI HEDEFİ: turnTo listesindeki mantıklı sonraki nokta
                    let angleTargetPos = physicalTarget; // Varsayılan: aynı noktaya bak
                    let nextPointId = turnTo.find(id => id !== 'entrance') || turnTo[0];
                    
                    if (nextPointId) {
                        const nextPoint = this.coordPoints.find(p => p.id === nextPointId);
                        if (nextPoint) {
                            // Açı hesaplaması için bu noktayı kullanacağız
                            angleTargetPos = nextPoint.position;
                        }
                    }
                    
                    // 3. AÇIYI HESAPLA: Araba physicalTarget'a gidecek ama angleTargetPos'a bakacak
                    const dx = angleTargetPos.x - nearestCoord.point.position.x /*this.root.position.x*/;
                    const dz = angleTargetPos.z - nearestCoord.point.position.z /*this.root.position.z*/;
                    targetAngle = Math.atan2(dx, dz) + (Math.PI / 2);
                    
                    // targetPos'u fiziksel hedef olarak ayarla (Bezier endPos için)
                    targetPos = physicalTarget;
                    targetPos.y = this.root.position.y;
                }

                const startPos = this.root.position.clone();
                const startDir = new BABYLON.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
                const delta = this.shortestAngleDelta(this.root.rotation.y, targetAngle);
                const turnDir = delta > 0 ? 1 : -1;
                const lateralVec = new BABYLON.Vector3(-startDir.z * turnDir, 0, startDir.x * turnDir);
                const control = startPos.add(startDir.scale(1.5)).add(lateralVec.scale(1.5));
            
                this.turnData = {
                    startPos: startPos,
                    control: control,
                    endPos: targetPos,
                    startAngle: this.root.rotation.y,
                    targetAngle: targetAngle,
                    progress: 0.0
                };
            
                if (nearestCoord && nearestCoord.point) {
                    const visited = new Set();
                    const queue = [];
                    let currentId = nearestCoord.point.id;
                    
                    while (currentId && currentId !== "entrance" && !visited.has(currentId)) {
                        visited.add(currentId);
                        const point = this.coordPoints.find(p => p.id === currentId);
                        if (!point) break;
                        
                        queue.push(point);
                        
                        // Get next: prefer non-entrance first to avoid early exit loops
                        const turnTo = point.turnTo || [];
                        const nextId = turnTo.find(id => id !== "entrance") || turnTo[0];
                        currentId = nextId;
                    }
                    // Add entrance if it's in the last point's turnTo
                    const lastPoint = queue[queue.length - 1];
                    if (lastPoint && (lastPoint.turnTo || []).includes("entrance")) {
                        const entrancePoint = this.coordPoints.find(p => p.id.includes("entrance"));
                        if (entrancePoint) queue.push(entrancePoint);
                    }
                    
                    this.exitPathQueue = queue;
                    //console.log(`🗺️ [EXIT PATH] Built queue with ${queue.length} points:`, queue.map(p => p.id));
                }

                this.currentIntent = "TURN_TO_EXIT_NODE";
                //console.log(`🔄 [INTENT SET] currentIntent = "TURN_TO_EXIT_NODE"`);
            
                this.targetSpeed = 0.05;
            }
            return; // Still sleeping, skip the rest of the update
        }

        const currentZ = this.root.position.z;
        const currentX = this.root.position.x;

        this.checkNearbyParkingSlots(allCars);

        if (this.roadType === "SIDE" && (this.sideRoad?.id === "parkingJunction" || this.sideRoad?.id === "parkingJunctionCFS") && !this.hasDetectedEntrance) {
            
            const nearest = this.findNearestParkingEntrance();
            if (nearest && nearest.distance < 5) {            
                // Random turn decision
                const turnChance = this.exitingCarPark ? -0.01 : 0.25;
                if (Math.random() < turnChance) {
                    this.currentIntent = "TURN_TO_PARKING";
                }
                this.hasDetectedEntrance = true;
                this.nearestEntrance = nearest; // Store for turning
            }
        }

        // Handle TURN_TO_PARKING
        if (this.currentIntent === "TURN_TO_PARKING" && this.nearestEntrance && !this.turnData) {
            const entrance = this.nearestEntrance.entrance;
            const targetX = entrance.x; // Turn left into lot
            const targetZ = entrance.z;
            const lotName = this.nearestEntrance.entrance.lotName?.toLowerCase() ?? '';
            const targetAngle = lotName.includes('big') ? -Math.PI / 2 : Math.PI / 2; // BigLot: left turn (-90°), angled/small: right (+90°)

            const startPos = this.root.position.clone();
            const startDir = new BABYLON.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
            const delta = this.shortestAngleDelta(this.root.rotation.y, targetAngle);
            const turnDir = delta > 0 ? 1 : -1;
            const lateralVec = new BABYLON.Vector3(-startDir.z * turnDir, 0, startDir.x * turnDir);
            const control = startPos.add(startDir.scale(1.5)).add(lateralVec.scale(1.5));

            this.turnData = {
                startPos,
                control,
                endPos: new BABYLON.Vector3(targetX, this.root.position.y, targetZ),
                startAngle: this.root.rotation.y,
                targetAngle,
                progress: 0.0
            };
        }
        
            // Check for nearby BIG_PARKING_COORD_POINTS and log detection
    if (this.coordPoints && this.coordPoints.length > 0) {
        const nearestCoord = this.findNearestCoordPoint();
        
        // ✅ FIX: if(!this.exitingCarPark) kontrolünü kaldırdık.
        // Çıkış yapan arabalar da row22 ve entrance mantığını kullanabilmeli.
        if (nearestCoord)
        {
            if (nearestCoord.distance < 0.5) {
                const targetIds = nearestCoord.point.turnTo || [];
                if (targetIds.length > 0) {
                    let nextTargetId = null;
                    const pointId = nearestCoord.point.id;

                    // 🟢 DEBUG: Log decision state
                    const pX = nearestCoord.point.position.x.toFixed(1);
                    const pZ = nearestCoord.point.position.z.toFixed(1);
                    //console.log(`📍 [DECISION] Point: ${pointId} | Pos: (${pX}, ${pZ}) | Exiting: ${this.exitingCarPark}`);

                    // 🟢 DYNAMIC: Matches "entrance", "small_entrance", "cfs_entrance", "aisle_start", etc.
                    const isDecisionNode = pointId.includes("22") /*|| pointId.includes("aisle_start")*/;
                    const isEntranceNode = pointId.includes("entrance") || pointId.includes("aisle_start");
                    console.log("isDecisionNode: ",isDecisionNode);
                    if (isDecisionNode && !this.isParking && !this.exitingCarPark) {
                        const exitChance = 0.2; // 100% for demo
                        if (Math.random() < exitChance) {
                            //console.log(`🚪 [CPS EXIT] Car at ${pointId} decided to exit (chance: ${exitChance})`);
                            this.exitingCarPark = true;
                        }
                    }
                    if (isEntranceNode && this.exitingCarPark) {
                        // 🎯 FIX: Flexible lot name matching ('big' matches 'BigBlock_Parking')
                        
                        let nearestJunction = null;
                        let minDist = Infinity;
                        const carPos = this.root.position;

                        for (const sr of (this.roadNetwork?.sideRoads || [])) {
                            const dx = carPos.x - (sr.side === 'left' ? -2.5 : 2.5);
                            const dz = carPos.z - sr.z;
                            const dist = Math.sqrt(dx * dx + dz * dz);
                            if (dist < minDist) {
                                minDist = dist;
                                nearestJunction = sr;
                            }
                        }

                        if (nearestJunction) {
                            this.roadType = "SIDE";
                            this.sideRoad = nearestJunction; // Crucial: tells merge logic which road it's on
                            this.currentIntent = "TURN_TO_SIDE";

                            // Turn onto the side road at the junction's exact Z position
                            const turnChoice = Math.random() < 0.5;
                            const targetAngle = turnChoice ? 0 : Math.PI;
                            //const targetAngle = (nearestJunction.side === 'left') ? 0 : Math.PI;
                            const endZ = nearestJunction.z + (turnChoice ? 1.25 : -1.25);
                            const targetX = this.root.position.x;

                            const startPos = this.root.position.clone();
                            const startDir = new BABYLON.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
                            const delta = this.shortestAngleDelta(this.root.rotation.y, targetAngle);
                            const turnDir = delta > 0 ? 1 : -1;
                            const lateralVec = new BABYLON.Vector3(-startDir.z * turnDir, 0, startDir.x * turnDir);
                            const control = startPos.add(startDir.scale(1.5)).add(lateralVec.scale(1.5));

                            this.turnData = {
                                startPos,
                                control,
                                endPos: new BABYLON.Vector3(targetX, this.root.position.y, endZ),
                                startAngle: this.root.rotation.y,
                                targetAngle: targetAngle,
                                progress: 0.0
                            };

                            this.exitingCarPark = false;
                            this.currentLotId = null;
                            return; // Let the turn logic handle the movement
                        }
                    }
                    if (!this.willExitCarPark) {
                        if (this.exitingCarPark && !isEntranceNode) {
                            // Exiting but not at entrance yet: prioritize path toward entrance
                            const exitTarget = targetIds.find(id => id.includes("entrance") || id.includes("aisle_start"));
                            nextTargetId = exitTarget || targetIds[0];
                        } else {
                            // Normal roaming or at entrance while not exiting
                            nextTargetId = targetIds[Math.floor(Math.random() * targetIds.length)];
                        }
                    }
                    // Move to next point
                    const nextPoint = this.coordPoints.find(p => p.id === nextTargetId);
                    if (nextPoint) {
                        const dx = nextPoint.position.x - this.root.position.x;
                        const dz = nextPoint.position.z - this.root.position.z;
                        this.root.rotation.y = Math.atan2(dx, dz) + (Math.PI / 2);
                        const fwd = this.getForward();
                        this.root.position.x += fwd.x * 0.5;
                        this.root.position.z += fwd.z * 0.5;
                        this.selectedCoordTarget = nextTargetId; 
                        this.currentSpeed = 0.1;
                        this.maxSpeed = 0.15;
                    }
                }
            }
        }
    }

        // 1. Junction check (main road uses Z triggers; side road uses its own junction Z)
        const junctionZs = this.roadNetwork?.sideRoads?.map(sr => sr.z) ?? [];

        for (const jZ of junctionZs) {
            if (this.roadType === "MAIN") {
                // Approaching from +Z towards -Z or from -Z towards +Z
                const inWindow = Math.abs(currentZ - jZ) < 4.0;
                if (inWindow && this.lastJunctionPassed !== jZ) {
                    this.makeDecisionAtJunction(jZ);
                }
            } else {
                // On side road, we merge when we reach the junction X where side road meets main road.
                if (this.sideRoad?.z !== jZ) continue;
                const roadHalf = (this.roadNetwork?.main?.width ?? 5) / 2;
                const dir = (this.sideRoad.side === "left") ? -1 : 1;
                const junctionX = dir * roadHalf;
                const inWindow = Math.abs(currentX - junctionX) < 1.4;
                const inWindowZ = Math.abs(currentZ - jZ) < 4.0;
                if (inWindow && this.lastJunctionPassed !== jZ) {
                    this.makeDecisionAtJunction(jZ);
                }
            }
        }

        // 2. Hedef Hızı Belirle
        if (this.isTurning) {
            this.targetSpeed = 0.04; // Dönüşte yavaşla
        } else {
            this.targetSpeed = this.maxSpeed; // Düz yolda gazla
        }

        // 2b. Front-car awareness (slow down to keep gap)
        const front = this.findCarInFront(allCars);
        if (front) {
            const desiredGap = 5.8 * this.scale;
            const hardBrakeGap = 2.9 * this.scale;
            const followLookahead = 14.0 * this.scale;

            // Never exceed the lead car's speed when we're behind it (stop & go supported)
            if (front.dist < followLookahead) {
                this.targetSpeed = Math.min(this.targetSpeed, front.car.currentSpeed);
            }

            if (front.dist < hardBrakeGap) {
                this.targetSpeed = 0;
            } else if (front.dist < desiredGap) {
                const t = (front.dist - hardBrakeGap) / Math.max(0.0001, (desiredGap - hardBrakeGap));
                const gapLimited = this.maxSpeed * Math.max(0, Math.min(1, t));
                this.targetSpeed = Math.min(this.targetSpeed, gapLimited);
            }
        }

        // IVME UYGULAMA (Lerp mantığı)
        // Mevcut hızı, hedef hıza doğru küçük adımlarla yaklaştırıyoruz
        if (this.currentSpeed < this.targetSpeed) {
            this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, this.targetSpeed);
        } else if (this.currentSpeed > this.targetSpeed) {
            this.currentSpeed = Math.max(this.currentSpeed - this.acceleration * 2, this.targetSpeed); // Fren daha sert olsun
        }

        // 3. Dönüş Kontrolü (Burada artık currentSpeed değişkenini biz yönetiyoruz)
        if (this.currentIntent === "TURN_TO_PARKING" || this.currentIntent === "TURN_TO_SIDE" || this.currentIntent === "TURN_TO_MAIN" || this.currentIntent === "TURN_TO_SLOT"  || this.currentIntent === "TURN_TO_EXIT_NODE") {
            if (this.turnData) {
                this.isTurning = true;

                const progress = this.turnData.progress;
                if (progress < 0.2) {
                    // Slow down phase
                    this.targetSpeed = Math.max(0.04, this.currentSpeed * 0.95);
                } else if (progress > 0.8) {
                    // Speed up phase
                    this.targetSpeed = this.maxSpeed;
                } else {
                    // Maintain low speed during turn
                    this.targetSpeed = 0.04;
                }

                // Rotate toward target
                const delta = this.shortestAngleDelta(this.root.rotation.y, this.turnData.targetAngle);
                const maxStep = 0.03;
                const step = Math.max(-maxStep, Math.min(maxStep, delta));
                this.root.rotation.y = this.normalizeAngle(this.root.rotation.y + step);

                // Lerp position slowly
                let nextPos;
                if (this.turnData.control) {
                    nextPos = this.quadraticBezier(this.turnData.progress, this.turnData.startPos, this.turnData.control, this.turnData.endPos);
                } else {
                    nextPos = BABYLON.Vector3.Lerp(this.turnData.startPos, this.turnData.endPos, this.turnData.progress);
                }
                this.root.position.copyFrom(nextPos);

                this.turnData.progress = Math.min(1, this.turnData.progress + 0.02);

                if (this.turnData.progress >= 1 && Math.abs(delta) < 0.06) {
                    this.root.rotation.y = this.normalizeAngle(this.turnData.targetAngle);
                    this.isTurning = false;

                    if (this.currentIntent === "TURN_TO_MAIN") {
                        this.roadType = "MAIN";
                        this.sideRoad = null;
                    } else if (this.currentIntent === "TURN_TO_SIDE") {
                        this.roadType = "SIDE";
                    }
                    else if (this.currentIntent === "TURN_TO_SLOT") {
                        this.currentSpeed = 0;
                        this.targetSpeed = 0;
                        this.isActive = false; // Freeze car
                        //console.log(`✅ [PARKED] Araç slota yerleşti.`);
                        return; // Skip remaining update logic
                    }
                    else if (this.currentIntent === "TURN_TO_EXIT_NODE") {
                        //console.log("✅ [EXIT TURN DONE] Facing exit direction. Driving forward...");
                        this.currentIntent = "STRAIGHT";
                        // ✅ DO NOT set this.exitingCarPark = false here. Let it stay true.
                    }

                    this.currentIntent = "STRAIGHT";
                    this.turnData = null;
                }

                // Skip normal straight motion
                return;
            }

            this.isTurning = false;
            
        }

        // 4. Hareket Hesaplaması (this.currentSpeed kullanarak)
        const fwd = this.getForward();
        const dx = fwd.x * this.currentSpeed;
        const dz = fwd.z * this.currentSpeed;

        this.root.position.x += dx;
        this.root.position.z += dz;

        if (this.currentSpeed < 0.01) {
            this.waitCounter++;
        } else {
            this.waitCounter = 0; // Hareket varsa sabır yenilenir
        }

        if (this.waitCounter > this.patience) {
            const fwd = this.getForward();
            this.root.position.x += fwd.x * 0.5;
            this.root.position.z += fwd.z * 0.5;
            this.currentSpeed = 0.08;
            this.targetSpeed = 0.08;
            this.waitCounter = 0;
        }
    }

findNearestParkingEntrance() {
        const pos = this.root.position;
        const ents = this.roadNetwork?.renderedParkingEntrances || this.parkingEntrances || [];
        let nearest = null;
        let minDist = Infinity;
        for (const ent of ents) {
            const dx = pos.x - ent.x;
            const dz = pos.z - ent.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < minDist) {
                minDist = dist;
                nearest = { entrance: ent, distance: minDist };
            }
        }
        return nearest;
    }

    findNearestCoordPoint() {
        const pos = this.root.position;
        const points = this.coordPoints || [];
        //console.log("Current pos: ",pos);
        //console.log("Points: ",points);
        let nearest = null;
        let minDist = Infinity;
        for (const point of points)
        {
            const pointPos = point.position;
            const dx = pointPos.x - pos.x;
            const dz = pointPos.z - pos.z;

            const toPoint = new BABYLON.Vector3(dx, 0, dz);
            const dist = toPoint.length();

            if(dist > 10)
                continue;

            if (dist < minDist) {
                minDist = dist;
                nearest = { point, distance: minDist };
                //console.log("[DEBUG] nearest found: ",nearest);
            }
        }

        // 🔧 FIX: entrance_pre'yi entrance'a yönlendir ve tetikleyiciyi hemen aktif et
        if(this.exitingCarPark)
        {
            if (nearest && nearest.point.id === 'entrance-pre') {
                const entrancePoint = points.find(p => p.id === 'entrance');
                if (entrancePoint) {
                    nearest.point = entrancePoint;
                    nearest.distance = 0.1; // < 0.5 koşulunu anında geçsin diye
                }
            }
        }
        
        return nearest;
    }

    checkBounds() {
        const pos = this.root.position;
        const roadHalf = (this.roadNetwork?.main?.width ?? 5) / 2;
        const sideRoads = this.roadNetwork?.sideRoads ?? [];
        const maxSideLen = sideRoads.reduce((best, sr) => Math.max(best, sr.length ?? 0), 0);
        const xLimit = roadHalf + maxSideLen + 8;
        const zMin = (this.roadNetwork?.main?.zMin ?? -50) - 8;
        const zMax = (this.roadNetwork?.main?.zMax ?? 50) + 8;
        return Math.abs(pos.x) > xLimit || pos.z < zMin || pos.z > zMax;
    }

    
}
