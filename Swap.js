import React, { useState } from 'react';

function Swap() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleSwap = () => {
    const rate = 200;
    setOutput((parseFloat(input) * rate).toFixed(2));
  };

  return (
    <div className="swap-card">
      <h2>Swap MON to SAHUR</h2>
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
