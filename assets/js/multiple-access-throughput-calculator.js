document.getElementById("calculatorForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get values from input fields
    var bandwidth = parseFloat(document.getElementById("bandwidth").value);
    var propagationTime = parseFloat(document.getElementById("propagationTime").value);
    var frameSize = parseFloat(document.getElementById("frameSize").value);
    var frameRate = parseFloat(document.getElementById("framerate").value);
    var MACLayerAccessMethod = document.getElementById("dropdown").value;

    var freqUnit = document.querySelector('input[name="freqUnit"]:checked');
    var timeUnit = document.querySelector('input[name="timeUnit"]:checked');
    var frameSizeUnit = document.querySelector('input[name="frameSizeUnit"]:checked');
    var frameRateUnit = document.querySelector('input[name="frameRateUnit"]:checked');

    // Validate input values
    if (!freqUnit || !timeUnit || !frameSizeUnit || !frameRateUnit) {
        alert("Please select all units for bandwidth, propagation time, frame size, and frame rate.");
        return;
    }

    if (bandwidth <= 0 || propagationTime <= 0 || frameSize <= 0 || frameRate <= 0) {
        alert("All input values must be positive.");
        return;
    }

    // Convert units to standard units
    if (freqUnit.value === 'GHz') bandwidth *= 1e9;
    if (freqUnit.value === 'MHz') bandwidth *= 1e6;
    if (freqUnit.value === 'KHz') bandwidth *= 1e3;

    if (timeUnit.value === 'msec') propagationTime /= 1e3;
    if (timeUnit.value === 'μsec') propagationTime /= 1e6;
    if (timeUnit.value === 'nsec') propagationTime /= 1e9;

    if (frameSizeUnit.value === 'Mbit') frameSize *= 1e6;
    if (frameSizeUnit.value === 'Kbit') frameSize *= 1e3;

    if (frameRateUnit.value === 'Mbit') frameRate *= 1e6;
    if (frameRateUnit.value === 'Kfps') frameRate *= 1e3;

    // Calculate throughput based on MAC Layer Access Method
    var frameTime;
    var G;
    var alpha;
    var throughput;

    frameTime = frameSize / bandwidth;
    G = frameRate * frameTime;
    alpha = propagationTime / frameTime;

    switch (MACLayerAccessMethod) {
        case 'unslotted_nonpersistent_CSMA':
            throughput = (G * Math.exp(-2 * alpha * frameTime)) / (G * (1 + 2 * alpha) + Math.exp(-alpha * G));
            break;
        case 'slotted_nonpersistent_CSMA':
            throughput = (alpha * (G * Math.exp(-2 * alpha * frameTime))) / (G * 1- Math.exp(-2 * alpha * G) + alpha);
            break;
        case 'unslotted_1persistent_CSMA':
            throughput = (G * (1 + G + alpha * G  * (1 + G + (alpha * G / 2))) * Math.exp(-G * (1 + 2 * alpha))) / (G * (1 + 2 * alpha) - (1 -  Math.exp(-2 * alpha * G)) + (1 + alpha * G) * Math.exp(-G * (1 + alpha)));
            break;
        case 'slotted_1persistent_CSMA':
            throughput = (G * (1 + alpha - Math.exp(-alpha * G)) * Math.exp(-G * (1 + alpha))) / ((1 + alpha) * (1 - Math.exp(-alpha * G)) + alpha * Math.exp(-G * (1 + alpha)));
            break;
        case 'pure_ALOHA':
            throughput = frameRate * frameTime * Math.exp(-2 * frameRate * frameTime);
            break;
        case 'slotted_ALOHA':
            throughput = frameRate * frameTime * Math.exp(-frameRate * frameTime);
            break;
        default:
            alert("Unknown MAC Layer Access Method.");
            return;
    }

    // Update the results in the HTML
    document.getElementById("frameTime").textContent = frameTime * 1e3 + " msec";
    document.getElementById("G").textContent = G;
    document.getElementById("α").textContent = alpha + " sec";
    document.getElementById("throughput").textContent = throughput.toFixed(5);
});
