const EnergyABI = {
  abi: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'wateringAmount',
          type: 'uint256',
        },
      ],
      name: 'watering',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
}
export default EnergyABI
