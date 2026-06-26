export class Magnetometer {
    constructor(scene, slot, serverComputer, options = {}) {
        this.scene = scene;
        this.slot = slot; // Expected: { x, z, angle, id }
        this.serverComputer = serverComputer;
        this.detectionRadius = options.detectionRadius || 0.25;
        this.isOccupied = false;
        
        // Generate a consistent ID matching ServerComputer's formatting
        this.slotId = `${this.slot.x.toFixed(1)}_${this.slot.z.toFixed(1)}`;
        
        this._buildMesh();
        
        // 🔗 CPS Connection: Register itself with the central server
        if (this.serverComputer && typeof this.serverComputer.registerMagnetometer === 'function') {
            this.serverComputer.registerMagnetometer(this);
        }
    }

    _buildMesh() {
        this.mesh = BABYLON.MeshBuilder.CreateCylinder(`mag_${this.slotId}`, {
            diameter: 0.25,
            height: 0.04,
            tessellation: 8
        }, this.scene);
        
        this.mesh.position.set(this.slot.x, 0.02, this.slot.z);
        this.mesh.rotation.y = this.slot.angle || 0;
        
        this.material = new BABYLON.StandardMaterial(`mag_mat_${this.slotId}`, this.scene);
        this.material.emissiveColor = new BABYLON.Color3(0.1, 1, 0.1); // 🟢 Green = Empty
        this.material.disableLighting = true;
        this.mesh.material = this.material;
    }

    // 🧠 Core Logic: Detect if a car's mass is physically in the slot
    checkOccupancy(allCars) {
        let detected = false;
        
        for (const car of allCars) {
            if (!car || !car.root) continue;

            // 1. Physical proximity check
            const dx = car.root.position.x - this.slot.x;
            const dz = car.root.position.z - this.slot.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // 2. Logical assignment check (fallback for perfectly parked cars)
            const isLogicallyAssigned = car.targetParkingSlot && 
                Math.abs(car.targetParkingSlot.x - this.slot.x) < 0.1 && 
                Math.abs(car.targetParkingSlot.z - this.slot.z) < 0.1;

            if (distance < this.detectionRadius || isLogicallyAssigned) {
                detected = true;
                break;
            }
        }

        // Only update and notify server if state actually changed
        if (this.isOccupied !== detected) {
            this.isOccupied = detected;
            this._updateVisuals();
            
            // 📡 YOUR REQUESTED CONSOLE LOG
            console.log(`🧲 [MAGNETOMETER] Slot ${this.slotId} is now ${this.isOccupied ? 'OCCUPIED 🔴' : 'EMPTY 🟢'}.`);

            if (this.serverComputer && typeof this.serverComputer.updateSlotState === 'function') {
                this.serverComputer.updateSlotState(this.slotId, this.isOccupied);
            }
        }
        
        return this.isOccupied;
    }

    _updateVisuals() {
        if (this.isOccupied) {
            this.material.emissiveColor = new BABYLON.Color3(1, 0.1, 0.1); // 🔴 Red = Occupied
        } else {
            this.material.emissiveColor = new BABYLON.Color3(0.1, 1, 0.1); // 🟢 Green = Empty
        }
    }

    dispose() {
        if (this.mesh) this.mesh.dispose();
        if (this.material) this.material.dispose();
    }
}