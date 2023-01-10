export const getWebSocketUrl = (): string => {
    if (Boolean(import.meta.env.IS_DEPLOYED)) {
        return `wss://${import.meta.env.SERVER}`;
    } else {
        return `ws://${import.meta.env.SERVER}`;
    }
};
