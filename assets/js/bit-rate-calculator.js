document.getElementById("calculatorForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    // Get values from input fields
    var bandwidth = parseFloat(document.getElementById("bandwidth").value);
    var quantizer = parseFloat(document.getElementById("quantizer").value);
    var compressionRate = parseFloat(document.getElementById("compressionRate").value);
    var channelEncoderRate = parseFloat(document.getElementById("channelEncoderRate").value);
    var interleaver = parseFloat(document.getElementById("interleaver").value);
    var freqUnit = document.getElementById('freqUnit');

    if (bandwidth <= 0 || quantizer <= 0 || compressionRate <= 0 || channelEncoderRate <= 0 || interleaver <= 0) {
        alert("All input values must be positive.");
        return;
    }

    if (!Number.isInteger(quantizer)) {
        alert("Quantizer must be an integer.");
        return;
    }

    if (!isPowerOfTwo(interleaver)) {
        alert("Interleaver value must be a power of 2 (2^x).");
        return;
    }

    if (freqUnit.value === 'GHz') bandwidth *= 1e9;
    if (freqUnit.value === 'MHz') bandwidth *= 1e6;
    if (freqUnit.value === 'KHz') bandwidth *= 1e3;
    

    var samplingFrequency = bandwidth * 2;
    var quantizationLevels = 2 ** quantizer;
    var sourceEncoderBitRate = (samplingFrequency * quantizer) * compressionRate;
    var channelEncoderBitRate = sourceEncoderBitRate / channelEncoderRate;
    var interleaverBitRate = channelEncoderBitRate;

    // Update the results in the HTML
    document.getElementById("samplingFrequency").textContent = samplingFrequency / 1e3 +  " K samples/sec";
    document.getElementById("quantizationLevels").textContent = quantizationLevels + " levels";
    document.getElementById("sourceEncoderBitRate").textContent = sourceEncoderBitRate / 1e3 + " Kbps";
    document.getElementById("channelEncoderBitRate").textContent = channelEncoderBitRate / 1e3 + " Kbps";
    document.getElementById("interleaverBitRate").textContent = interleaverBitRate / 1e3 + " Kbps";
});

// Function to check if a number is a power of two
function isPowerOfTwo(number) {
    return number > 0 && (number & (number - 1)) === 0;
}