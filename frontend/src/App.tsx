import { useState, createRef, useEffect, RefObject } from 'react';
import { Box, Button, Heading, Input, Text } from '@chakra-ui/react';
import { playerOptsAtom } from './states/atoms';
import { PlayerOpts } from './states/types';
import { useAtom } from 'jotai';
import { getEmbeddedYoutubeUrl, getYoutubeIdFromUrl } from './api/youtube';
import { io } from 'socket.io-client';
import { SyncData } from './types';
import YouTubePlayer from 'yt-player';

const socket = io();

const InputEmbeddedYouTubeUrl = () => {
    const [optsJotai, setOptsJotai] = useAtom(playerOptsAtom);
    const [opts, setOpts] = useState<PlayerOpts>(optsJotai);

    return (
        <Box>
            <Input
                value={opts.url}
                onChange={(e) =>
                    setOpts({ url: e.target.value, currentTime: 0 })
                }
                placeholder="Enter YouTube URL from the share button"
            />
            <Button onClick={() => setOptsJotai(opts)}>Submit</Button>
        </Box>
    );
};

interface Player {
    playerController: YouTubePlayer;
}

const createPlayer = (
    playerRef: RefObject<HTMLDivElement>,
    url: string
): YouTubePlayer => {
    const youtubeId = getYoutubeIdFromUrl(url);

    const playerVars = {
        height: '1920',
        width: '1080',
    };

    console.log(playerRef.current);

    const player = new YouTubePlayer(playerRef.current!);

    if (!youtubeId) {
        return player;
    }

    player.load(youtubeId);

    return player;

    /* TODO: Implement error handling
    } catch {
        const errorMessages = (
            <Text>
                The URL must be got from the YouTube share button. (This issues
                will be fix.)
            </Text>
        );
        return errorMessages;
    }
        */
};

interface renderPlayer {
    Player: React.FC;
    playerElementRef: RefObject<HTMLDivElement>;
}

const renderPlayer = (): renderPlayer => {
    const playerElementRef = createRef<HTMLDivElement>();
    const Player = () => {
        return <div ref={playerElementRef}></div>;
    };
    return { Player, playerElementRef };
};

const syncPlayer = (ytPlayer: YouTubePlayer | undefined) => {
    // const [playerOpts, setPlayerOpts] = useAtom(playerOptsAtom);
    if (!ytPlayer) {
        console.log('youtubeController is undefined');
        return;
    }

    if (ytPlayer === null) {
        console.log('youtubeController is null');
        return;
    }

    const recivedSyncDataArray: SyncData[] = [];

    socket.on('sync', (data) => {
        console.log(data);
        const recivedSyncData = {
            currentPlayingTimestamp: data.currentPlayingTimestamp,
            sentTimestamp: new Date(data.sentTimestamp),
        };
        recivedSyncDataArray.push(recivedSyncData);
        if (recivedSyncDataArray.length < socket.listeners.length) {
            return;
        }
        recivedSyncDataArray.sort((a, b) => {
            return a.sentTimestamp.getTime() - b.sentTimestamp.getTime();
        });

        const dataToSync = recivedSyncDataArray[0];

        // FIXME: This process should be split with another function.
        ytPlayer.seek(dataToSync.currentPlayingTimestamp);

        //  setPlayerOpts({
        //      url: playerOpts.url,
        //      currentTime: dataToSync.currentPlayingTimestamp,
        //  });
    });

    setInterval(() => {
        // FIXME: This process should be split with another function.
        const currentPlayingTimestamp = ytPlayer.getCurrentTime();
        /// const currentPlayingTimestamp: number = playerOpts.currentTime;
        const sentTimestamp = new Date();

        const syncData: SyncData = {
            currentPlayingTimestamp,
            sentTimestamp,
        };

        socket.emit('sync', syncData);
    }, 10000);
};

function App() {
    const [opts, setOpts] = useAtom(playerOptsAtom);
    const { Player, playerElementRef } = renderPlayer();

    let player: YouTubePlayer;

    useEffect(() => {
        console.log('useEffect');
        player = createPlayer(playerElementRef, opts.url);
        syncPlayer(player);
    });

    return (
        <Box>
            <Heading>Syncyt</Heading>
            <Text fontSize="xl">
                Watch YouTube videos with your friends synchronously
            </Text>
            <InputEmbeddedYouTubeUrl />
            <Player />
        </Box>
    );
}

export default App;
