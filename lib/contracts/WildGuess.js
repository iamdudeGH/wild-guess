export class WildGuess {
    constructor(contractAddress, client) {
        this.contractAddress = contractAddress;
        this.client = client;
    }

    // Write method
    async submit_challenge(player, imageUrl, correctAnimal) {
        return await this.client.callContractMethod(
            this.contractAddress,
            'submit_challenge',
            [player, imageUrl, correctAnimal]
        );
    }

    // Read methods
    async get_challenge(challengeId) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_challenge',
            [challengeId]
        );
    }

    async get_player_stats(player) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_player_stats',
            [player]
        );
    }

    async get_recent_challenges(limit) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_recent_challenges',
            [limit]
        );
    }

    async get_player_challenges(player, limit) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_player_challenges',
            [player, limit]
        );
    }

    async get_leaderboard(limit) {
        return await this.client.readContractMethod(
            this.contractAddress,
            'get_leaderboard',
            [limit]
        );
    }
}
