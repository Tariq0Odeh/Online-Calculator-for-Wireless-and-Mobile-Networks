document.getElementById("resourceCalculatorForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get values from input fields
    var timeSlots = parseFloat(document.getElementById("timeSlots").value);
    var regionArea = parseFloat(document.getElementById("regionArea").value);
    var regionAreaUnit = document.getElementById("regionAreaUnit").value;
    var numUsers = parseFloat(document.getElementById("numUsers").value);
    var numUsersUnit = document.getElementById("numUsersUnit").value;
    var avgCalls = parseFloat(document.getElementById("avgCalls").value);
    var avgCallsUnit = document.getElementById("avgCallsUnit").value;
    var avgCallDuration = parseFloat(document.getElementById("avgCallDuration").value);
    var avgCallDurationUnit = document.getElementById("avgCallDurationUnit").value;
    var callDropProb = parseFloat(document.getElementById("callDropProb").value);
    var minSIR = parseFloat(document.getElementById("minSIR").value);
    var minSIRUnit = document.getElementById("minSIRUnit").value;
    var powerRef = parseFloat(document.getElementById("powerRef").value);
    var powerRefUnit = document.getElementById("powerRefUnit").value;
    var refDistance = parseFloat(document.getElementById("refDistance").value);
    var refDistanceUnit = document.getElementById("refDistanceUnit").value;
    var pathLossExponent = parseFloat(document.getElementById("pathLossExponent").value);
    var receiverSensitivity = parseFloat(document.getElementById("receiverSensitivity").value);
    var receiverSensitivityUnit = document.getElementById("receiverSensitivityUnit").value;

    // Unit conversions
    if (regionAreaUnit === 'km2') regionArea *= 1e6; // Convert km² to m²
    if (numUsersUnit === 'hundred') numUsers *= 1e2;
    if (numUsersUnit === 'thousand') numUsers *= 1e3;

    if (avgCallsUnit === 'hour') avgCalls *= 24; // Convert to calls per day
    if (avgCallsUnit === 'month') avgCalls /= 30; // Convert to calls per day
    if (avgCallsUnit === 'year') avgCalls /= 365; // Convert to calls per day

    if (avgCallDurationUnit === 'sec') avgCallDuration /= 60; // Convert to minutes
    if (avgCallDurationUnit === 'hour') avgCallDuration *= 60; // Convert to minutes

    if (refDistanceUnit === 'cm') refDistance /= 100; // Convert to meters
    if (refDistanceUnit === 'km') refDistance *= 1000; // Convert to meters

    // Convert powerRef to Watts if necessary
    if (powerRefUnit === 'dBm') {
        powerRef = Math.pow(10, (powerRef - 30) / 10); // Convert dBm to Watts
    } else if (powerRefUnit === 'dB') {
        powerRef = Math.pow(10, powerRef / 10); // Convert dB to ratio
    }

    // Convert receiver sensitivity to Watts if necessary
    if (receiverSensitivityUnit === 'dBm') {
        receiverSensitivity = Math.pow(10, (receiverSensitivity - 30) / 10); // Convert dBm to Watts
    } else if (receiverSensitivityUnit === 'dB') {
        receiverSensitivity = Math.pow(10, receiverSensitivity / 10); // Convert dB to ratio
    } else if (receiverSensitivityUnit === 'milliwatt') {
        receiverSensitivity /= 1e3
    } else if (receiverSensitivityUnit === 'microwatt') {
        receiverSensitivity /= 1e6
    }

    if (minSIRUnit === 'dBm') {
        minSIR = Math.pow(10, (minSIR - 30) / 10); // Convert dBm to Watts
    } else if (minSIRUnit === 'dB') {
        minSIR = Math.pow(10, minSIR / 10); // Convert dB to ratio
    }

    // Validate inputs
    if (isNaN(timeSlots) || timeSlots <= 0 || !Number.isInteger(timeSlots)) {
        alert("Please enter a valid positive integer for the number of time slots per carrier.");
        return;
    }
    if (isNaN(regionArea) || regionArea <= 0) {
        alert("Please enter a valid region area.");
        return;
    }
    if (isNaN(numUsers) || numUsers <= 0 || !Number.isInteger(numUsers)) {
        alert("Please enter a valid positive integer for the number of users.");
        return;
    }
    if (isNaN(avgCalls) || avgCalls <= 0) {
        alert("Please enter a valid average number of calls.");
        return;
    }
    if (isNaN(avgCallDuration) || avgCallDuration <= 0) {
        alert("Please enter a valid average call duration.");
        return;
    }
    if (isNaN(callDropProb) || callDropProb <= 0 || callDropProb > 1) {
        alert("Please enter a valid call drop probability.");
        return;
    }
    if (isNaN(minSIR) || minSIR < 0) {
        alert("Please enter a valid minimum SIR.");
        return;
    }
    if (isNaN(powerRef)) {
        alert("Please enter a valid power measured at reference distance.");
        return;
    }
    if (isNaN(refDistance) || refDistance <= 0) {
        alert("Please enter a valid reference distance.");
        return;
    }
    if (isNaN(pathLossExponent) || pathLossExponent <= 0) {
        alert("Please select a valid path loss exponent.");
        return;
    }
    if (isNaN(receiverSensitivity) || receiverSensitivity <= 0) {
        alert("Please enter a valid receiver sensitivity.");
        return;
    }

    // Calculate maximum distance
    var maxDistance = refDistance * Math.pow(powerRef / receiverSensitivity, 1 / (pathLossExponent));

    // Calculate maximum cell size
    var cellArea = (3 * Math.sqrt(3) * Math.pow(maxDistance, 2)) / 2;

    // Calculate number of cells in the service area
    var numCells = Math.ceil(regionArea / cellArea);

    // Calculate traffic load per user
    var trafficLoadPerUser = avgCalls * avgCallDuration / (60 * 24); // Convert to Erlangs

    // Calculate traffic load in the whole cellular system
    var trafficLoadSystem = trafficLoadPerUser * numUsers;

    // Calculate traffic load in each cell
    var trafficLoadCell = trafficLoadSystem / numCells;

    function findNumberOfCellsInCluster(minSIR) {
        const N_required = Math.pow((6 * minSIR), 2 / pathLossExponent) / 3;

        let i = 0;
        let j = 1;
        let N = 0;
        let smallest_N = Infinity;

        while (i <= Math.ceil(Math.sqrt(N_required))) {
            j = 1;
            while (j <= Math.ceil(Math.sqrt(N_required))) {
                N = i * i + i * j + j * j;
                if (N >= N_required && N < smallest_N) {
                    smallest_N = N;
                }
                j++;
            }
            i++;
        }

        return smallest_N;
    }


    function factorial(n) {
        if (n === 0) return 1;
        let result = 1;
        for (let i = 1; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    function erlangB(E, C) {
        let numerator = Math.pow(E, C) / factorial(C);
        let denominator = 0;
        for (let k = 0; k <= C; k++) {
            denominator += Math.pow(E, k) / factorial(k);
        }
        return numerator / denominator;
    }

    function findChannels(E, QoS) {
        let C = 1;
        while (true) {
            if (erlangB(E, C) <= QoS) {
                return C;
            }
            C++;
        }
    }

    // Calculate number of cells in each cluster
    var numCellsCluster = findNumberOfCellsInCluster(minSIR);

    // Calculate the minimum number of channels needed
    var minChannels = findChannels(trafficLoadCell, callDropProb);
    var minChannelsWithQos = findChannels(trafficLoadCell, 0.05);

    // Calculate minimum number of carriers needed
    var minCarriersPerCell = Math.ceil(minChannels / timeSlots);
    var minCarriersPerCellWithQoS = Math.ceil(minChannelsWithQos / timeSlots);

    var minCarrier = minCarriersPerCell * numCellsCluster
    var minCarrierWithQoS = minCarriersPerCellWithQoS * numCellsCluster

    // Update results
    document.getElementById("maxDistance").textContent = maxDistance.toFixed(2) + " meters";
    document.getElementById("maxCellSize").textContent = cellArea.toFixed(2) + " m²";
    document.getElementById("numCells").textContent = numCells;
    document.getElementById("trafficLoadPerUser").textContent = trafficLoadPerUser.toFixed(2) + " Erlangs";
    document.getElementById("trafficLoadSystem").textContent = trafficLoadSystem.toFixed(2) + " Erlangs";
    document.getElementById("trafficLoadCell").textContent = trafficLoadCell.toFixed(2) + " Erlangs";
    document.getElementById("numCellsCluster").textContent = numCellsCluster;
    document.getElementById("minChannels").textContent = minChannels;
    document.getElementById("minCarriersPerCell").textContent = minCarriersPerCell;
    document.getElementById("minCarriers").textContent = minCarrier;
    document.getElementById("minCarriersWithQoS").textContent = minCarrierWithQoS;
});