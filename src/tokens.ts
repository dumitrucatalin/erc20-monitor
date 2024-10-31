import axios from 'axios';

export interface TokenData {
    id?: string;
    symbol: string;
    name?: string;
    contractAddress: string;
    decimals: number;
}

async function fetchTokenDetails(id: string): Promise<TokenData | null> {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
        const data = response.data;
        return {
            id: data.id,
            symbol: data.symbol,
            name: data.name,
            contractAddress: data.platforms.ethereum || 'N/A',
            decimals: data?.platforms?.ethereum?.decimals || 18,
        };
    } catch (error) {
        console.error(`Error fetching details for token ${id}:`, error);
        return null;
    }
}

export async function fetchERC20Tokens(): Promise<TokenData[]> {
    const tokens: TokenData[] = [];
    let page = 1;
    const perPage = 10;

    try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                category: 'ethereum-ecosystem',
                order: 'market_cap_desc',
                per_page: perPage,
                page: page,
            },
        });

        for (const token of data) {
            const tokenDetails = await fetchTokenDetails(token.id);
            if (tokenDetails) tokens.push(tokenDetails);
            await new Promise(res => setTimeout(res, 500)); // delay to avoid rate limiting
        }
    } catch (error) {
        console.error('Error fetching tokens:', error);
    }

    return tokens;
}