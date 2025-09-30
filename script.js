// Load Sats Connect if not already loaded (redundancy for reliability)
if (typeof window.satsConnect === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@hirosystems/sats-connect@2/dist/index.js';
    script.onload = () => console.log('Sats Connect loaded successfully');
    script.onerror = () => console.error('Failed to load Sats Connect');
    document.head.appendChild(script);
}

document.getElementById('buyBtn').addEventListener('click', async () => {
    console.log('Button clicked - attempting wallet connection'); // Debug log

    if (!window.satsConnect) {
        alert('Sats Connect not available. Please install and unlock Xverse wallet extension.');
        console.error('Sats Connect not found');
        return;
    }

    try {
        console.log('Requesting wallet accounts...'); // Debug log
        const result = await window.satsConnect.request('getAccounts', {
            purposes: ['ordinals', 'payment'],
            message: 'Connect to buy Ordinals by WizrdMcBlizzrd'
        });
        const address = result.accounts.find(acc => acc.purpose === 'ordinals')?.address || result.accounts[0]?.address;
        if (address) {
            alert(`Connected to Xverse wallet: ${address}`);
            console.log('Connection successful:', address);
        } else {
            alert('No address returned. Try again.');
        }
    } catch (err) {
        alert('Connection failed: ' + err.message + '. Make sure Xverse is unlocked and permissions are granted.');
        console.error('Connection error:', err);
    }
});
