if (nearestCoord.distance < 0.5) {
    const targetIds = nearestCoord.point.turnTo || [];
    if (targetIds.length > 0) {
        let nextTargetId = null;
        const pointId = nearestCoord.point.id;

        // 🟢 DEBUG: Log decision state
        const pX = nearestCoord.point.position.x.toFixed(1);
        const pZ = nearestCoord.point.position.z.toFixed(1);
        console.log(`📍 [DECISION] Point: ${pointId} | Pos: (${pX}, ${pZ}) | Exiting: ${this.exitingCarPark}`);

        // 🟢 DYNAMIC: Matches "entrance", "small_entrance", "cfs_entrance", "aisle_start", etc.
        const isEntranceNode = pointId.includes("entrance") || pointId.includes("aisle_start");

        if (isEntranceNode) {
            // 🟢 CPS EXIT DECISION: Roaming cars in CPS lot can decide to exit here
            if (!this.isParking && !this.exitingCarPark && this.currentLotId?.includes("CFS")) {
                const exitChance = 1.0; // 100% for demo - make configurable later
                if (Math.random() < exitChance) {
                    console.log(`🚪 [CPS EXIT] Car at ${pointId} decided to exit (chance: ${exitChance})`);
                    this.exitingCarPark = true;
                }
            }

            // Execute exit maneuver if car wants to leave
            if (this.exitingCarPark) {
                const exitPoint = this.roadNetwork.renderedParkingEntrances.find(e => 
                    e.lotName === this.currentLotId
                );

                if (exitPoint) {
                    this.roadType = "SIDE";
                    this.currentIntent = "TURN_TO_SIDE";
                    
                    const turnChoice = Math.random() < 0.5;
                    const targetAngle = turnChoice ? 0 : Math.PI;
                    
                    // Use actual exitPoint.z for correct merge position
                    const endZ = exitPoint.z + (turnChoice ? 1.25 : -1.25);
                    
                    const startPos = this.root.position.clone();
                    const startDir = new BABYLON.Vector3(Math.sin(this.root.rotation.y), 0, Math.cos(this.root.rotation.y));
                    const delta = this.shortestAngleDelta(this.root.rotation.y, targetAngle);
                    const turnDir = delta > 0 ? 1 : -1;
                    const lateralVec = new BABYLON.Vector3(-startDir.z * turnDir, 0, startDir.x * turnDir);
                    const control = startPos.add(startDir.scale(1.5)).add(lateralVec.scale(1.5));
                    
                    this.turnData = {
                        startPos, control,
                        endPos: new BABYLON.Vector3(exitPoint.x, this.root.position.y, endZ),
                        startAngle: this.root.rotation.y,
                        targetAngle,
                        progress: 0.0
                    };
                    this.exitingCarPark = false;
                    this.currentLotId = null;
                    return; 
                }
            }
            else {
                // Roaming near entrance, not exiting yet
                if (!this.willExitCarPark) {
                    nextTargetId = targetIds[Math.floor(Math.random() * targetIds.length)];
                }
            }
        } 
        else {
            // Standard roaming logic for internal nodes (row22, cfs_row22, etc.)
            if (this.exitingCarPark) {
                // Prioritize path towards any entrance node when exiting
                const exitTarget = targetIds.find(id => id.includes("entrance") || id.includes("aisle_start"));
                nextTargetId = exitTarget || targetIds[0];
            } else {
                // Random roaming
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