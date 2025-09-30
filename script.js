document.getElementById('buyBtn').addEventListener('click', async () => {
    if (!window.satsConnect) {
        alert('Sats Connect not loaded. Ensure Xverse is installed and active.');
        return;
    }
    try {
        const result = await window.satsConnect.request('getAccounts', {
            purposes: ['ordinals', 'payment'],
            message: 'Connect to buy Ordinals by WizrdMcBlizzrd'
        });
        const address = result.accounts.find(acc => acc.purpose === 'ordinals').address;
        alert(`Connected to Xverse wallet: ${address}`);
    } catch (err) {
        alert('Wallet connection failed: ' + err.message + '. Ensure Xverse is installed and unlocked.');
    }
});
