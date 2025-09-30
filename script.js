document.getElementById('buyBtn').addEventListener('click', async () => {
    try {
        const result = await window.satsConnect.request('getAccounts', {
            purposes: ['ordinals', 'payment'],
            message: 'Connect to buy Ordinals by WizrdMcBlizzrd'
        });
        const address = result.accounts.find(acc => acc.purpose === 'ordinals').address;
        alert(`Connected to Xverse wallet: ${address}`);
        // Store address or proceed with next step (e.g., payment) here later
    } catch (err) {
        alert('Wallet connection failed: ' + err.message + '. Install Xverse wallet.');
    }
});
