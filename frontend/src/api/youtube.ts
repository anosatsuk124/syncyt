export const getYoutubeIdFromUrl = (url: string): string | undefined => {
    // FIXME: This is a hacky way to get the youtube id from the url. Should it be implemented using Google Search APIs?
    const regex = /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/;
    const id = url.match(regex);
    return id ? id[1] : undefined;
};

export const getEmbeddedYoutubeUrl = (url: string): string => {
    const youtubeId = getYoutubeIdFromUrl(url);
    if (youtubeId === null) {
        throw new Error(`Invalid youtube url: ${url}`);
    }
    return `https://www.youtube.com/embed/${youtubeId}`;
};
