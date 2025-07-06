import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// === Konfigurasi Kontrak ===
const routerAddress = "0xC812758E706cDc5b530Cb5F93F43826564c2bcCe";
const wmonAddress = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
const sahurAddress = "0x3d0511092fa816a3cA4662573162444B20085002";

// Minimal ABI untuk token ERC20
const erc20ABI = [
  "function approve(address spender, uint amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint)",
  "function balanceOf(address owner) view returns (uint)"
];

// Router ABI (wrap + unwrap + swap)
const routerABI = [
  "function wrapMON() public payable",
  "function unwrapMON(uint amount) public",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

function Swap() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // === Connect Wallet ===
  const connectWallet = async () => {
    if (window.ethereum) {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = _provider.getSigner();
      const _account = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
    } else {
      alert("Please install MetaMask");
    }
  };

  // === Swap Logika ===
  const handleSwap = async () => {
    if (!signer) return alert("Connect wallet dulu");

    const router = new ethers.Contract(routerAddress, routerABI, signer);
    const wmon = new ethers.Contract(wmonAddress, erc20ABI, signer);
    const amountIn = ethers.utils.parseEther(input);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 menit dari sekarang

    try {
      // 1. Wrap MON
      const txWrap = await router.wrapMON({ value: amountIn });
      await txWrap.wait();

      // 2. Approve Router untuk pakai WMON
      const allowance = await wmon.allowance(account, routerAddress);
      if (allowance.lt(amountIn)) {
        const txApprove = await wmon.approve(routerAddress, amountIn);
        await txApprove.wait();
      }

      // 3. Swap WMON → SAHUR
      const path = [wmonAddress, sahurAddress];
      const txSwap = await router.swapExactTokensForTokens(
        amountIn,
        0, // amountOutMin
        path,
        account,
        deadline
      );
      await txSwap.wait();

      alert("Swap sukses!");
    } catch (err) {
      console.error(err);
      alert("Swap gagal");
    }
  };

  useEffect(() => {
    if (input) {
      const rate = 200;
      setOutput((parseFloat(input) * rate).toFixed(2));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <div className="swap-card">
      <h2>Swap MON ↔ SAHUR</h2>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div><small>Wallet: {account}</small></div>
      )}

      <input
        type="number"
        placeholder="Enter MON amount"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="estimate">≈ {output} SAHUR</div>
      <button onClick={handleSwap}>Swap</button>
    </div>
  );
}

export default Swap;
