document.getElementById("resourceBlockCalculatorForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get values from input fields
    var nQam = parseFloat(document.getElementById("nQam").value);
    var resourceBlockBandwidth = parseFloat(document.getElementById("resourceBlockBandwidth").value);
    var subcarrierSpacing = parseFloat(document.getElementById("subcarrierSpacing").value);
    var ofdmSymbols = parseFloat(document.getElementById("ofdmSymbols").value);
    var resourceBlockDuration = parseFloat(document.getElementById("resourceBlockDuration").value);
    var parallelResourceBlocks = parseFloat(document.getElementById("parallelResourceBlocks").value);
    var freqUnit = document.getElementById('freqUnit').value;
    var subcarrierUnit = document.getElementById('subcarrierUnit').value;
    var timeUnit = document.getElementById('timeUnit').value;

    // Function to check if a number is a power of 2
    function isPowerOfTwo(x) {
        return (x & (x - 1)) === 0;
    }

    // Validate inputs
    if (isNaN(nQam) || nQam <= 0 || !Number.isInteger(nQam) || !isPowerOfTwo(nQam)) {
        alert("n-QAM must be a positive integer and a power of 2.");
        return;
    }
    if (isNaN(resourceBlockBandwidth) || resourceBlockBandwidth <= 0) {
        alert("Resource Block Bandwidth must be a positive number.");
        return;
    }
    if (isNaN(subcarrierSpacing) || subcarrierSpacing <= 0) {
        alert("Subcarrier Spacing must be a positive number.");
        return;
    }
    if (isNaN(ofdmSymbols) || ofdmSymbols <= 0 || !Number.isInteger(ofdmSymbols)) {
        alert("OFDM Symbols must be a positive integer.");
        return;
    }
    if (isNaN(resourceBlockDuration) || resourceBlockDuration <= 0) {
        alert("Resource Block Duration must be a positive number.");
        return;
    }
    if (isNaN(parallelResourceBlocks) || parallelResourceBlocks <= 0 || !Number.isInteger(parallelResourceBlocks)) {
        alert("Parallel Resource Blocks must be a positive integer.");
        return;
    }

    // Convert units to standard units
    if (freqUnit === 'GHz') resourceBlockBandwidth *= 1e9;
    if (freqUnit === 'MHz') resourceBlockBandwidth *= 1e6;
    if (freqUnit === 'KHz') resourceBlockBandwidth *= 1e3;

    if (subcarrierUnit === 'GHz') subcarrierSpacing *= 1e9;
    if (subcarrierUnit === 'MHz') subcarrierSpacing *= 1e6;
    if (subcarrierUnit === 'KHz') subcarrierSpacing *= 1e3;

    if (timeUnit === 'msec') resourceBlockDuration /= 1e3;
    if (timeUnit === 'μsec') resourceBlockDuration /= 1e6;
    if (timeUnit === 'nsec') resourceBlockDuration /= 1e9;

    // Calculations
    var bitsPerResourceElement = Math.log2(nQam);
    var resourceElementsPerOFDM = resourceBlockBandwidth / subcarrierSpacing;

    // Check if resourceElementsPerOFDM is an integer
    if (!Number.isInteger(resourceElementsPerOFDM)) {
        alert("The number of resource elements per OFDM symbol (Resource Block Bandwidth / Subcarrier Spacing) must be an integer.");
        return;
    }

    var bitsPerOFDM = bitsPerResourceElement * resourceElementsPerOFDM;
    var bitsPerResourceBlock = bitsPerOFDM * ofdmSymbols;
    var maxTransmissionRate = (bitsPerResourceBlock * parallelResourceBlocks) / resourceBlockDuration;

    // Function to format the results
    function formatOutput(value, type = 'rate') {
        const units = type === 'rate' ? ['bps', 'Kbps', 'Mbps', 'Gbps'] : ['bits', 'Kbits', 'Mbits', 'Gbits'];
        let unitIndex = 0;
        while (value >= 1000 && unitIndex < units.length - 1) {
            value /= 1000;
            unitIndex++;
        }
        if (type === 'rate') {
            return value.toFixed(2) + ' ' + units[unitIndex];
        } else {
            return Math.floor(value) + ' ' + units[unitIndex];
        }
    }

    // Update the results in the HTML
    document.getElementById("bitsPerResourceElement").textContent = formatOutput(bitsPerResourceElement, 'quantity');
    document.getElementById("resourceElementsPerOFDM").textContent = formatOutput(resourceElementsPerOFDM, 'quantity');
    document.getElementById("bitsPerOFDM").textContent = formatOutput(bitsPerOFDM, 'quantity');
    document.getElementById("bitsPerResourceBlock").textContent = formatOutput(bitsPerResourceBlock, 'quantity');
    document.getElementById("maxTransmissionRate").textContent = formatOutput(maxTransmissionRate, 'rate');
});