document.getElementById('calculatorForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Fetch the JSON data
    fetch('assets/data/psk_ber_theoretical.json')
        .then(response => response.json())
        .then(data => {
            // Function to find Eb/No for given BER and modulation type
            function findEbNoForBER(targetBER, modulationType, EbNos, BERData) {
                const modulationKey = modulationType.toUpperCase();
                const BER = BERData[modulationKey];

                for (let i = 0; i < BER.length; i++) {
                    if (BER[i] <= targetBER) {
                        return EbNos[i];
                    }
                }
                return null;
            }

            // Get values from input fields
            const frequency = parseFloat(document.getElementById('freqency').value); // Correct typo: should be 'frequency'
            const freqUnit = document.getElementById('freqUnit').value;
            const dataRate = parseFloat(document.getElementById('dataRate').value);
            const dataRateUnit = document.getElementById('dataRateUnit').value;
            const pathLoss = parseFloat(document.getElementById('pathLoss').value);
            const pathLossUnit = document.getElementById('pathLossUnit').value;
            const transmitAntennaGain = parseFloat(document.getElementById('transmitAntennaGain').value);
            const transmitAntennaGainUnit = document.getElementById('transmitAntennaGainUnit').value;
            const receiveAntennaGain = parseFloat(document.getElementById('receiveAntennaGain').value);
            const receiveAntennaGainUnit = document.getElementById('receiveAntennaGainUnit').value;
            const transmitAmplifierGain = parseFloat(document.getElementById('transmitAmplifierGain').value);
            const transmitAmplifierGainUnit = document.getElementById('transmitAmplifierGainUnit').value;
            const antennaFeedLineLoss = parseFloat(document.getElementById('antennaFeedLineLoss').value);
            const antennaFeedLineLossUnit = document.getElementById('antennaFeedLineLossUnit').value;
            const otherLosses = parseFloat(document.getElementById('otherLosses').value);
            const otherLossesUnit = document.getElementById('otherLossesUnit').value;
            const fadeMargin = parseFloat(document.getElementById('fadeMargin').value);
            const fadeMarginUnit = document.getElementById('fadeMarginUnit').value;
            const receiverAmplifierGain = parseFloat(document.getElementById('receiverAmplifierGain').value);
            const receiverAmplifierGainUnit = document.getElementById('receiverAmplifierGainUnit').value;
            const noiseFigureTotal = parseFloat(document.getElementById('noiseFigureTotal').value);
            const noiseFigureTotalUnit = document.getElementById('noiseFigureTotalUnit').value;
            const linkMargin = parseFloat(document.getElementById('linkMargin').value);
            const linkMarginUnit = document.getElementById('linkMarginUnit').value;
            const noiseTemperature = parseFloat(document.getElementById('noiseTemperature').value);
            const modulatedSignal = document.getElementById('dropdown').value;
            const bitErrorRate = parseFloat(document.getElementById('bitErrorRate').value);
            const Boltzmanns = 1.38 * 1e-23;

            // Validation
            if (frequency < 0 || dataRate < 0 || fadeMargin < 0 || noiseTemperature < 0 || bitErrorRate < 0) {
                alert("Frequency, data rate, fade margin, noise temperature, and bit error rate must be non-negative.");
                return;
            }

            // Adjust inputs based on units
            const convertToDb = (value, unit) => {
                switch (unit) {
                    case 'dBm': return value - 30;

                    case 'Hz': return 10 * Math.log10(value);
                    case 'KHz': return 10 * Math.log10(value * 1e3);
                    case 'MHz': return 10 * Math.log10(value * 1e6);
                    case 'GHz': return 10 * Math.log10(value * 1e9);

                    case 'bps': return 10 * Math.log10(value);
                    case 'Kbps': return 10 * Math.log10(value * 1e3);
                    case 'Mbps': return 10 * Math.log10(value * 1e6);

                    case 'Watt': return 10 * Math.log10(value);
                    case 'KWatt': return 10 * Math.log10(value * 1e3);
                    case 'MWatt': return 10 * Math.log10(value * 1e6);
                    case 'GWatt': return 10 * Math.log10(value * 1e9);

                    case 'T': return 10 * Math.log10(value);

                    default: return value;
                }
            };


            const convertDbToWatt = (valueInDb) => {
                return Math.pow(10, valueInDb / 10);
            };

            // Calculations
            const frequencyInDb = convertToDb(frequency, freqUnit);
            const dataRateInDb = convertToDb(dataRate, dataRateUnit);
            const pathLossInDb = convertToDb(pathLoss, pathLossUnit);
            const transmitAntennaGainInDb = convertToDb(transmitAntennaGain, transmitAntennaGainUnit);
            const receiveAntennaGainInDb = convertToDb(receiveAntennaGain, receiveAntennaGainUnit);
            const antennaFeedLineLossInDb = convertToDb(antennaFeedLineLoss, antennaFeedLineLossUnit);
            const otherLossesInDb = convertToDb(otherLosses, otherLossesUnit);
            const fadeMarginInDb = convertToDb(fadeMargin, fadeMarginUnit);
            const receiverAmplifierGainInDb = convertToDb(receiverAmplifierGain, receiverAmplifierGainUnit);
            const transmitAmplifierGainInDb = convertToDb(transmitAmplifierGain, transmitAmplifierGainUnit);
            const noiseFigureTotalInDb = convertToDb(noiseFigureTotal, noiseFigureTotalUnit);
            const noiseTemperatureInDp = convertToDb(noiseTemperature, "T");
            const linkMarginInDb = convertToDb(linkMargin, linkMarginUnit);
            const BoltzmannsInDb = convertToDb(Boltzmanns, 'Watt');
            const ebno = findEbNoForBER(bitErrorRate, modulatedSignal, data.EbNos, data);


            // Calculate power values only if ebno is found
            if (ebno !== null) {
                const powerReceived = linkMarginInDb + BoltzmannsInDb + noiseTemperatureInDp + noiseFigureTotalInDb + dataRateInDb + ebno;
                const powerTransmitted = powerReceived + pathLossInDb + antennaFeedLineLossInDb + otherLossesInDb + fadeMarginInDb - (transmitAntennaGainInDb + receiveAntennaGainInDb + transmitAmplifierGainInDb + receiverAmplifierGainInDb);

                // Update the HTML elements, uncomment and adjust accordingly
                document.getElementById("powerReceivedDb").textContent = powerReceived.toFixed(5) + " dB";
                document.getElementById("powerReceivedWatt").textContent = convertDbToWatt(powerReceived).toExponential() + " Watts";
                document.getElementById("powerTransmittedDb").textContent = powerTransmitted.toFixed(5) + " dB";
                document.getElementById("powerTransmittedWatt").textContent = convertDbToWatt(powerTransmitted).toExponential() + " Watts";
            } else {
                console.error(`Eb/No for ${modulatedSignal} (BER = ${bitErrorRate}): Not found`);
            }
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
});

