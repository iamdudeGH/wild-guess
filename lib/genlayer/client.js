import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

export class GenlayerClient {
    constructor(rpcUrl, account = null) {
        this.rpcUrl = rpcUrl;
        
        const config = {
            chain: studionet,
        };

        if (account) {
            config.account = account;
        }

        this.client = createClient(config);
    }

    async callContractMethod(contractAddress, method, args = []) {
        try {
            console.log('Calling write method:', method, 'with args:', args);
            
            const result = await this.client.writeContract({
                address: contractAddress,
                functionName: method,
                args: args,
            });
            
            console.log('Write result:', result);
            return result;

        } catch (error) {
            console.error('Contract write error:', error);
            throw error;
        }
    }

    async readContractMethod(contractAddress, method, args = []) {
        try {
            console.log('=== GenLayer Read Contract ===');
            console.log('Contract:', contractAddress);
            console.log('Method:', method);
            console.log('Args:', args);
            console.log('Client config:', this.client);
            
            const result = await this.client.readContract({
                address: contractAddress,
                functionName: method,
                args: args,
            });
            
            console.log('✅ Read result:', result);
            return result;

        } catch (error) {
            console.error('❌ Contract read error details:', {
                method: method,
                args: args,
                error: error,
                message: error.message,
                details: error.details,
                cause: error.cause
            });
            throw error;
        }
    }

}
