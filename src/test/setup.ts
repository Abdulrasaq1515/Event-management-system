import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_API_URL = '/api';
process.env.SOLANA_RPC_URL = 'https://api.devnet.solana.com';
