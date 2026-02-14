import path from 'path';
import * as fs from 'fs';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import * as api from './api';
// ✅ Import your specific config classes
import { currentDir, UndeployedConfig, PreviewConfig, PreprodConfig } from './config';
import { createLogger } from './logger';
import 'dotenv/config';

let logger: Awaited<ReturnType<typeof createLogger>>;

async function main() {
  console.log('\n================================================');
  console.log('   Divorce Settlement Tracker - Contract Deploy   ');
  console.log('================================================\n');

  const rl = readline.createInterface({ input, output });
  let walletContext: api.WalletContext | null = null;

  try {
    // 1. Setup Logging
    const logDir = path.resolve(currentDir, '..', 'logs', 'deploy', `${new Date().toISOString()}.log`);
    logger = await createLogger(logDir);
    api.setLogger(logger);

    // 2. Select Network
    console.log('Select Network:');
    console.log('1. Local (Docker/Undeployed)');
    console.log('2. Preview (Public Testnet)');
    console.log('3. Preprod (Public Testnet)');
    
    const networkChoice = await rl.question('Enter choice [default: 1]: ');
    
    let config;
    let networkName = 'local';
    const isPublicNetwork = networkChoice.trim() === '2' || networkChoice.trim() === '3';

    if (networkChoice.trim() === '2') {
        config = new PreviewConfig();
        networkName = 'preview';
    } else if (networkChoice.trim() === '3') {
        config = new PreprodConfig();
        networkName = 'preprod';
    } else {
        config = new UndeployedConfig();
        networkName = 'undeployed';
    }

    console.log(`\n✅ Selected Config: ${networkName.toUpperCase()}`);

    // 3. Handle Wallet Seed
    let walletSeed: string;
    
    if (isPublicNetwork) {
        // Public networks need your real Lace wallet seed
        console.log('\n⚠️  Make sure your Lace wallet is set to the same network!');
        walletSeed = await rl.question('Enter your 64-character hex seed: ');
        if (walletSeed.length !== 64) {
            throw new Error('Invalid Seed: Must be exactly 64 hexadecimal characters.');
        }
    } else {
        // Local mode
        const seedChoice = await rl.question('Use custom wallet seed? (y/n, default: n): ');
        if (seedChoice.toLowerCase().startsWith('y')) {
            walletSeed = await rl.question('Enter your 64-character hex seed: ');
        } else {
            // Genesis seed for local docker
            walletSeed = '0000000000000000000000000000000000000000000000000000000000000001';
            console.log('Using default Genesis seed for Local Network.');
        }
    }

    rl.close(); 

    // 4. Build Wallet & Wait for Sync
    walletContext = await api.buildWalletAndWaitForFunds(config, walletSeed);
    
    if (!walletContext) {
        throw new Error("Failed to initialize wallet context.");
    }

    const walletAddress = walletContext.unshieldedKeystore.getBech32Address();
    
    // 5. Deploy Divorce Settlement Contract
    console.log('\nConfiguring providers...');
    const providers = await api.configureProviders(walletContext, config);

    console.log('Deploying Divorce Settlement contract... (This may take 1-2 minutes)');
    
    // Deploy with empty private state (all privacy is handled by ZK circuits)
    const privateState = {};
    const deployedContract = await api.deploy(providers, privateState);

    const contractAddress = deployedContract.deployTxData.public.contractAddress;

    // 6. Save Deployment Info
    const deploymentInfo = {
      contractAddress,
      deployedAt: new Date().toISOString(),
      network: networkName,
      walletAddress,
      project: 'Divorce Settlement Tracker',
      description: 'Divorcing parties track compliance with settlement terms on-chain with amounts and conditions hidden from public court records',
      config: {
        indexer: config.indexer,
        node: config.node,
        proofServer: config.proofServer,
      },
    };

    const deploymentPath = path.resolve(currentDir, '..', 'deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('\n================================================');
    console.log('✅ DIVORCE SETTLEMENT CONTRACT DEPLOYED');
    console.log(`📍 Address: ${contractAddress}`);
    console.log(`📂 Saved to: ${deploymentPath}`);
    console.log('================================================\n');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  } finally {
    if (walletContext) {
        try { await api.closeWallet(walletContext); } catch (e) {}
    }
    process.exit(0);
  }
}

main();