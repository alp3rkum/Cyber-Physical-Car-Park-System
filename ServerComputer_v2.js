// ServerComputer.js
export class ServerComputer {
    constructor(scene, lotReference, position, scale) {
        this.scene = scene;
        this.targetLot = lotReference;
        this.slots = lotReference.customSlots || [];
        this.position = position || { x: 0, y: 0, z: 0 };
        this.scale = scale || { x: 1, y: 1, z: 1 };
        
        this.magnetometers = [];
        this.slotStates = new Map(); // Stores { "x_z": boolean } as ground truth
        
        this._buildPhysicalMesh();
    }

    _buildPhysicalMesh() {
        this.root = new BABYLON.TransformNode("server_root", this.scene);
        this.root.position.set(this.position.x, this.position.y, this.position.z);
        this.root.scaling.set(this.scale.x, this.scale.y, this.scale.z);

        const w = 1.0, h = 1.8, d = 1.2;
        this.box = BABYLON.MeshBuilder.CreateBox("server_box", { width: w, height: h, depth: d }, this.scene);
        
        const mat = new BABYLON.StandardMaterial("server_mat", this.scene);
        const tex = new BABYLON.Texture("assets/server.png", this.scene);
        tex.wrapU = BABYLON.Texture.CLAMP_ADDRESS;
        tex.wrapV = BABYLON.Texture.CLAMP_ADDRESS;
        tex.anisotropicFilteringLevel = 4;
        mat.diffuseTexture = tex;
        mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        mat.emissiveColor = new BABYLON.Color3(0.08, 0.08, 0.1);
        
        this.box.material = mat;
        this.box.parent = this.root;
        this.box.position.y = h / 2;

        const ledMat = new BABYLON.StandardMaterial("server_led_mat", this.scene);
        ledMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.8);
        ledMat.disableLighting = true;
        this.led = BABYLON.MeshBuilder.CreateBox("server_led", { width: w-0.15, height: 0.1, depth: d+0.03 }, this.scene);
        this.led.material = ledMat;
        this.led.position.set(0, h - 0.25, 0);
        this.led.parent = this.root;
    }

    registerMagnetometer(magnetometer) {
        this.magnetometers.push(magnetometer);
        this.slotStates.set(magnetometer.slotId, false); // Initialize as empty
    } 

    // 🆕 CPS: Receive telemetry from a sensor
    updateSlotState(slotId, isOccupied) {
        // 1. Mevcut durum haritasını güncelle
        this.slotStates.set(slotId, isOccupied);

        // 2. Bağlı tabelalar varsa, durum her değiştiğinde metinlerini güncelle
        if (this.ledSigns && this.ledSigns.length > 0) {
            
            // Bu sunucuya bağlı olan (yani haritadaki) TÜM boş slotların güncel sayısını bul
            let totalEmptySlots = 0;
            this.slots.forEach(slot => {
                const id = `${slot.x.toFixed(1)}_${slot.z.toFixed(1)}`;
                // Eğer slotStates haritasında true (dolu) değilse boş kabul et
                if (!this.slotStates.get(id)) {
                    totalEmptySlots++;
                }
            });

            // 3. Her bir tabelayı kendi filtrelediği alt slot kümesine (this.slots) göre güncelle
            this.ledSigns.forEach(sign => {
                if (sign.slots && sign.slots.length > 0) {
                    // Tabelanın sadece kendi sorumlu olduğu slotlardaki boş sayısını hesapla
                    let signEmptyCount = 0;
                    sign.slots.forEach(signSlot => {
                        const id = `${signSlot.x.toFixed(1)}_${signSlot.z.toFixed(1)}`;
                        if (!this.slotStates.get(id)) {
                            signEmptyCount++;
                        }
                    });

                    // İstediğin formata göre metni dinamik basıyoruz
                    if (signEmptyCount === 0) {
                        sign.updateText("#FF4444", `0 SLOTS\nAVAILABLE HERE`);
                    } else {
                        sign.updateText("#FFFF00", `${signEmptyCount} SLOTS\nAVAILABLE HERE`);
                    }
                } else {
                    // Eğer tabelaya özel bir slot kümesi atanmadıysa genel sunucu boş sayısını bas
                    if (totalEmptySlots === 0) {
                        sign.updateText("#FF4444", `0 SLOTS\nAVAILABLE HERE`);
                    } else {
                        sign.updateText("#FFFF00", `${totalEmptySlots} SLOTS\nAVAILABLE HERE`);
                    }
                }
            });
        }
    }

    getAllSlots() {
        return this.slots.map(s => ({
            id: `${s.x.toFixed(1)}_${s.z.toFixed(1)}`,
            x: s.x,
            z: s.z,
            angle: s.angle || 0,
            lotName: this.targetLot.name
        }));
    }

    findNearestSlot(targetX, targetZ) {
        let nearest = null;
        let minDist = Infinity;
        for (const slot of this.slots) {
            const dx = targetX - slot.x;
            const dz = targetZ - slot.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < minDist) {
                minDist = dist;
                nearest = { ...slot, distance: dist };
            }
        }
        return nearest;
    }

    // 🧠 CPS: Doluluk durumunu analiz et (Sensör verisini önceliklendirir)
    getOccupancyMap(allCars) {
        // 1. Trigger all physical sensors to check their environment
        for (const mag of this.magnetometers) {
            mag.checkOccupancy(allCars);
        }

        // 2. Build the occupancy map
        return this.slots.map(slot => {
            const slotId = `${slot.x.toFixed(1)}_${slot.z.toFixed(1)}`;
            let isOccupied = false;

            if (this.slotStates.has(slotId)) {
                isOccupied = this.slotStates.get(slotId);
            } else {
                isOccupied = allCars.some(car => 
                    !car.isActive && car.targetParkingSlot &&
                    Math.abs(car.targetParkingSlot.x - slot.x) < 0.1 &&
                    Math.abs(car.targetParkingSlot.z - slot.z) < 0.1
                );
            }

            return {
                x: slot.x,
                z: slot.z,
                angle: slot.angle,
                isOccupied: isOccupied,
                lotName: this.targetLot.name,
                hasSensor: this.slotStates.has(slotId)
            };
        });
    }

    dispose() {
        if (this.box) this.box.dispose();
        if (this.led) this.led.dispose();
        if (this.root) this.root.dispose();
        this.magnetometers.forEach(mag => mag.dispose());
    }
}