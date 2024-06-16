import numpy as np
import matplotlib.pyplot as plt
from scipy import special
import json

def BER_psk(M, EbNo):
    EbNo_lin = 10 ** (EbNo / 10)
    if M > 4:
        P = special.erfc(np.sqrt(EbNo_lin * np.log2(M)) * np.sin(np.pi / M)) / np.log2(M)
    else:
        P = 0.5 * special.erfc(np.sqrt(EbNo_lin))
    return P

EbNos = np.arange(0, 30)  # array of Eb/No in dBs
Ms = [4, 8, 16]  # modulation orders: QPSK, 8-PSK, 16-PSK

# Theoretical results dictionary
BER_theor_dict = {
    'EbNos': EbNos.tolist(),
    'BPSK/QPSK': BER_psk(4, EbNos).tolist(),
    '8-PSK': BER_psk(8, EbNos).tolist(),
    '16-PSK': BER_psk(16, EbNos).tolist()
}

# Save dictionary as JSON
with open('psk_ber_theoretical.json', 'w') as json_file:
    json.dump(BER_theor_dict, json_file, indent=4)

# Plot theoretical BER
fig, ax = plt.subplots(figsize=(10, 7), dpi=300)

plt.semilogy(EbNos, BER_theor_dict['BPSK/QPSK'], label='QPSK (theory)', linestyle='-', marker='o')
plt.semilogy(EbNos, BER_theor_dict['8-PSK'], label='8-PSK (theory)', linestyle='-', marker='o')
plt.semilogy(EbNos, BER_theor_dict['16-PSK'], label='16-PSK (theory)', linestyle='-', marker='o')

ax.set_ylim(1e-7, 2)
ax.set_xlim(0, 25)

plt.title("Theoretical BER for QPSK, 8-PSK, and 16-PSK")
plt.xlabel('EbNo (dB)')
plt.ylabel('BER')
plt.grid()
plt.legend(loc='upper right')
plt.savefig('psk_ber_theoretical.png')
plt.show()
