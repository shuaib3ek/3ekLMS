// Mock Glocumal Client SDK
// In real life, this fetches from api.glocumal.com

export type GlocumalLabConfig = {
    region: string;
    blueprintId: string; // e.g., 'aws-sandbox-v2'
    durationMinutes: number;
}

export type GlocumalInstance = {
    id: string;
    url: string;
    status: 'PROVISIONING' | 'RUNNING' | 'FAILED';
    expiresAt: string;
}

export const glocumal = {
    async provisionLab(config: GlocumalLabConfig): Promise<GlocumalInstance> {
        // Simulate API latency
        await new Promise(r => setTimeout(r, 1500));

        // Simulate success/fail
        if (Math.random() < 0.05) {
            throw new Error("Glocumal Capacity Exceeded");
        }

        const id = `lab-${Math.random().toString(36).substring(7)}`;
        return {
            id,
            url: `https://${id}.glocumal-labs.com?token=abc`,
            status: 'RUNNING', // Simplified for immediate gratification
            expiresAt: new Date(Date.now() + config.durationMinutes * 60000).toISOString()
        };
    }
};
