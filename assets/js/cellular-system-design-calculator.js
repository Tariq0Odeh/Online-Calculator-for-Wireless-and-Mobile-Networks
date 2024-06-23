document.getElementById("resourceCalculatorForm").addEventListener("submit", function(event) {
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

    // validate inputs
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
        alert("Please select a valid call drop probability.");
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
    if (isNaN(receiverSensitivity)) {
        alert("Please enter a valid receiver sensitivity.");
        return;
    }

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
    }  else if (minSIRUnit === 'dB') {
        minSIR = Math.pow(10, minSIR / 10); // Convert dB to ratio
    }

    // Calculate maximum distance
    var maxDistance = refDistance * Math.pow(powerRef / receiverSensitivity, 1 / (pathLossExponent));

    // Calculate maximum cell size
    var cellArea = (3 * Math.sqrt(3) * Math.pow(maxDistance, 2)) / 2;

    // Calculate number of cells in the service area
    var numCells = regionArea / cellArea;

    // Calculate traffic load per user
    var trafficLoadPerUser = avgCalls * avgCallDuration / (60*24); // Convert to Erlangs

    // Calculate traffic load in the whole cellular system
    var trafficLoadSystem = trafficLoadPerUser * numUsers;

    // Calculate traffic load in each cell
    var trafficLoadCell = trafficLoadSystem / numCells;

    function findNumberOfCellsInCluster(minSIR) {
        const N_required = Math.pow((6 * minSIR), 2 / 3) / 3;

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
    

    // Calculate number of cells in each cluster
    var numCellsCluster = findNumberOfCellsInCluster(minSIR);

    // Erlang B table for call drop probabilities
    var erlangBTable = {
        0.001: [0.001, 0.046, 0.194, 0.439, 0.762, 1.1, 1.6, 2.1, 2.6, 3.1, 3.7, 4.2, 4.8, 5.4, 6.1, 6.7, 7.4, 8.0, 8.7, 9.4, 10.1, 10.8, 11.5, 12.2, 13.0, 13.7, 14.4, 15.2, 15.9, 16.7, 17.4, 18.2, 19.0, 19.7, 20.5, 21.3, 22.1, 22.9, 23.7, 24.4, 25.2, 26.0, 26.8, 27.6, 28.4],
        0.002: [0.002, 0.065, 0.249, 0.535, 0.900, 1.3, 1.8, 2.3, 2.9, 3.4, 4.0, 4.6, 5.3, 5.9, 6.6, 7.3, 7.9, 8.6, 9.4, 10.1, 10.8, 11.5, 12.3, 13.0, 13.8, 14.5, 15.3, 16.1, 16.8, 17.6, 18.4, 19.2, 20.0, 20.8, 21.6, 22.4, 23.2, 24.0, 24.8, 25.6, 26.4, 27.2, 28.1, 28.9, 29.7],
        0.005: [0.005, 0.105, 0.349, 0.701, 1.132, 1.6, 2.2, 2.7, 3.3, 4.0, 4.6, 5.3, 6.0, 6.7, 7.4, 8.1, 8.8, 9.6, 10.3, 11.1, 11.9, 12.6, 13.4, 14.2, 15.0, 15.8, 16.6, 17.4, 18.2, 19.0, 19.9, 20.7, 21.5, 22.3, 23.2, 24.0, 24.8, 25.7, 26.5, 27.4, 28.2, 29.1, 29.9, 30.8, 31.7],
        0.01: [0.010, 0.153, 0.455, 0.869, 1.361, 1.9, 2.5, 3.1, 3.8, 4.5, 5.2, 5.9, 6.6, 7.4, 8.1, 8.9, 9.7, 10.4, 11.2, 12.0, 12.8, 13.7, 14.5, 15.3, 16.1, 17.0, 17.8, 18.6, 19.5, 20.3, 21.2, 22.0, 22.9, 23.8, 24.6, 25.5, 26.4, 27.3, 28.2, 29.0, 29.9, 30.8, 31.7, 32.5, 33.4],
        0.02: [0.020, 0.223, 0.602, 1.092, 1.657, 2.3, 2.9, 3.6, 4.3, 5.1, 5.8, 6.6, 7.4, 8.2, 9.0, 9.8, 10.7, 11.5, 12.3, 13.2, 14.0, 14.9, 15.8, 16.6, 17.5, 18.4, 19.3, 20.2, 21.0, 21.9, 22.8, 23.7, 24.6, 25.5, 26.4, 27.3, 28.2, 29.1, 30.0, 30.9, 31.8, 32.7, 33.6, 34.5, 35.4],
        0.03: [0.031, 0.282, 0.715, 1.259, 1.875, 2.5, 3.2, 4.0, 4.7, 5.5, 6.3, 7.1, 8.0, 8.8, 9.6, 10.5, 11.4, 12.2, 13.1, 14.0, 14.9, 15.8, 16.7, 17.6, 18.5, 19.4, 20.3, 21.2, 22.1, 23.1, 24.0, 24.9, 25.8, 26.8, 27.7, 28.6, 29.6, 30.5, 31.5, 32.4, 33.4, 34.3, 35.3, 36.3, 37.2],
        0.05: [0.053, 0.381, 0.899, 1.525, 2.218, 3.0, 3.7, 4.5, 5.4, 6.2, 7.1, 8.0, 8.8, 9.7, 10.6, 11.5, 12.5, 13.4, 14.3, 15.2, 16.2, 17.1, 18.1, 19.0, 20.0, 20.9, 21.9, 22.9, 23.8, 24.8, 25.8, 26.7, 27.7, 28.7, 29.7, 30.7, 31.6, 32.6, 33.6, 34.6, 35.6, 36.6, 37.6, 38.6, 39.6],
        0.07: [0.075, 0.470, 1.057, 1.748, 2.504, 3.3, 4.1, 5.0, 5.9, 6.8, 7.7, 8.6, 9.5, 10.5, 11.4, 12.4, 13.4, 14.3, 15.3, 16.3, 17.3, 18.2, 19.2, 20.2, 21.2, 22.2, 23.2, 24.2, 25.2, 26.2, 27.2, 28.2, 29.3, 30.3, 31.3, 32.3, 33.3, 34.4, 35.4, 36.4, 37.5, 38.5, 39.5, 40.6, 41.6],
        0.10: [0.111, 0.595, 1.271, 2.045, 2.881, 3.8, 4.7, 5.6, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5, 16.6, 17.6, 18.7, 19.7, 20.7, 21.8, 22.8, 23.9, 24.9, 26.0, 27.0, 28.1, 29.2, 30.2, 31.3, 32.4, 33.4, 34.5, 35.6, 36.6, 37.7, 38.8, 39.9, 41.0, 42.0, 43.1, 44.2],
        0.15: [0.176, 0.796, 1.602, 2.501, 3.454, 4.4, 5.5, 6.5, 7.6, 8.6, 9.7, 10.8, 11.9, 13.0, 14.1, 15.2, 16.3, 17.4, 18.5, 19.6, 20.8, 21.9, 23.0, 24.2, 25.3, 26.4, 27.6, 28.7, 29.9, 31.0, 32.1, 33.3, 34.4, 35.6, 36.7, 37.9, 39.0, 40.2, 41.3, 42.5, 43.6, 44.8, 45.9, 47.1, 48.2],
        0.20: [0.250, 1.000, 1.930, 2.950, 4.010, 5.1, 6.2, 7.4, 8.5, 9.7, 10.9, 12.0, 13.2, 14.4, 15.6, 16.8, 18.0, 19.2, 20.4, 21.6, 22.8, 24.1, 25.3, 26.5, 27.7, 28.9, 30.2, 31.4, 32.6, 33.8, 35.1, 36.3, 37.5, 38.8, 40.0, 41.2, 42.4, 43.7, 44.9, 46.1, 47.4, 48.6, 49.9, 51.1, 52.3],
        0.30: [0.429, 1.450, 2.633, 3.890, 5.189, 6.5, 7.9, 9.2, 10.6, 12.0, 13.3, 14.7, 16.1, 17.5, 18.9, 20.3, 21.7, 23.1, 24.5, 25.9, 27.3, 28.7, 30.1, 31.6, 33.0, 34.4, 35.8, 37.2, 38.6, 40.0, 41.5, 42.9, 44.3, 45.7, 47.1, 48.6, 50.0, 51.4, 52.8, 54.2, 55.7, 57.1, 58.5, 59.9, 61.3]
    };

    // Find the minimum number of channels needed for the given traffic load in each cell
    function findChannels(trafficLoad, erlangTable) {
        for (let channels = 1; channels < erlangTable.length; channels++) {
            if (trafficLoad <= erlangTable[channels-1]) {
                return channels;
            }
        }
        return erlangTable.length - 1; // If load exceeds table, return max channels
    }

    // Determine the appropriate Erlang B table based on call drop probability
    var erlangTable = erlangBTable[callDropProb];

    // Calculate the minimum number of channels needed
    var minChannels = findChannels(trafficLoadCell, erlangTable);

    // Calculate minimum number of carriers needed
    var minCarriersPerCell = Math.ceil(minChannels / timeSlots);

    var minCarrier = minCarriersPerCell * numCellsCluster

    // Update results
    document.getElementById("maxDistance").textContent = maxDistance.toFixed(2) + " meters";
    document.getElementById("maxCellSize").textContent = cellArea.toFixed(2) + " m²";
    document.getElementById("numCells").textContent = Math.ceil(numCells);
    document.getElementById("trafficLoadPerUser").textContent = trafficLoadPerUser.toFixed(2) + " Erlangs";
    document.getElementById("trafficLoadSystem").textContent = trafficLoadSystem.toFixed(2) + " Erlangs";
    document.getElementById("trafficLoadCell").textContent = trafficLoadCell.toFixed(2) + " Erlangs";
    document.getElementById("numCellsCluster").textContent = numCellsCluster;
    document.getElementById("minChannels").textContent = minChannels;
    document.getElementById("minCarriersPerCell").textContent = minCarriersPerCell;
    document.getElementById("minCarriers").textContent = minCarrier;
});
