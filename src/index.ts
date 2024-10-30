import { startMonitoring } from './monitor';

(async () => {
    try {
        await startMonitoring();
    } catch (error) {
        console.error('Error in monitoring:', error);
    }
})();