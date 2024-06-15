document.getElementById("calculatorForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get values from input fields
    var bandwidth = parseFloat(document.getElementById("bandwidth").value);
    var quantizer = parseFloat(document.getElementById("quantizer").value);
    var compressionRate = parseFloat(document.getElementById("compressionRate").value);
    var channelEncoderRate = parseFloat(document.getElementById("channelEncoderRate").value);
    var interleaver = parseFloat(document.getElementById("interleaver").value);
    var freqUnit = document.getElementById('freqUnit');

    // Validation
    if (isNaN(bandwidth) || bandwidth <= 0) {
      alert("Bandwidth must be a positive number and not zero.");
      return;
    }
    if (isNaN(quantizer) || quantizer <= 0 || !Number.isInteger(quantizer)) {
      alert("Quantizer must be a positive integer.");
      return;
    }
    if (isNaN(compressionRate) || compressionRate <= 0 || compressionRate > 1) {
      alert("Compression rate must be a number between 0 and 1.");
      return;
    }
    if (isNaN(channelEncoderRate) || channelEncoderRate <= 0 || channelEncoderRate > 1) {
      alert("Channel encoder rate must be a number between 0 and 1.");
      return;
    }
    if (isNaN(interleaver) || interleaver <= 0 || !Number.isInteger(interleaver) || !isPowerOfTwo(interleaver)) {
      alert("Interleaver value must be a positive integer and a power of 2 (2^x).");
      return;
    }

    // Adjust bandwidth based on unit
    if (freqUnit.value === 'GHz') bandwidth *= 1e9;
    if (freqUnit.value === 'MHz') bandwidth *= 1e6;
    if (freqUnit.value === 'KHz') bandwidth *= 1e3;

    // Calculations
    var samplingFrequency = bandwidth * 2;
    var quantizationLevels = 2 ** quantizer;
    var sourceEncoderBitRate = (samplingFrequency * quantizer) * compressionRate;
    var channelEncoderBitRate = sourceEncoderBitRate / channelEncoderRate;
    var interleaverBitRate = channelEncoderBitRate;

    // Update the results in the HTML
    if (freqUnit.value === 'GHz'){
      document.getElementById("samplingFrequency").textContent = (samplingFrequency / 1e9).toFixed(2) + " G samples/sec";
      document.getElementById("quantizationLevels").textContent = quantizationLevels + " Levels";
      document.getElementById("sourceEncoderBitRate").textContent = (sourceEncoderBitRate / 1e9).toFixed(2) + " Gbps";
      document.getElementById("channelEncoderBitRate").textContent = (channelEncoderBitRate / 1e9).toFixed(2) + " Gbps";
      document.getElementById("interleaverBitRate").textContent = (interleaverBitRate / 1e9).toFixed(2) + " Gbps";
    }
    else if(freqUnit.value === 'MHz'){
      document.getElementById("samplingFrequency").textContent = (samplingFrequency / 1e6).toFixed(2) + " M samples/sec";
      document.getElementById("quantizationLevels").textContent = quantizationLevels + " Levels";
      document.getElementById("sourceEncoderBitRate").textContent = (sourceEncoderBitRate / 1e6).toFixed(2) + " Mbps";
      document.getElementById("channelEncoderBitRate").textContent = (channelEncoderBitRate / 1e6).toFixed(2) + " Mbps";
      document.getElementById("interleaverBitRate").textContent = (interleaverBitRate / 1e6).toFixed(2) + " Mbps";
    }
    else{
      document.getElementById("samplingFrequency").textContent = (samplingFrequency / 1e3).toFixed(2) + " K samples/sec";
      document.getElementById("quantizationLevels").textContent = quantizationLevels + " Levels";
      document.getElementById("sourceEncoderBitRate").textContent = (sourceEncoderBitRate / 1e3).toFixed(2) + " Kbps";
      document.getElementById("channelEncoderBitRate").textContent = (channelEncoderBitRate / 1e3).toFixed(2) + " Kbps";
      document.getElementById("interleaverBitRate").textContent = (interleaverBitRate / 1e3).toFixed(2) + " Kbps";
    }
  });

  // Function to check if a number is a power of two
  function isPowerOfTwo(number) {
    return number > 0 && (number & (number - 1)) === 0;
  }