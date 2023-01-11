import { useState, createRef, useEffect, RefObject } from 'react';
import { Box, Button, Heading, Input, Text } from '@chakra-ui/react';
import { playerOptsAtom } from './states/atoms';
import { PlayerOpts } from './states/types';
import { useAtom } from 'jotai';
import { getEmbeddedYoutubeUrl, getYoutubeIdFromUrl } from './api/youtube';
import { io } from 'socket.io-client';
import { SyncData } from './types';
import YoutubeController from '@itkyk/youtube-controller';

const socket = io();
YoutubeController.initYoutubeApi();

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
    playerElement: JSX.Element;
    playerController: YoutubeController;
}

const createPlayer = (): Player => {
    const [playerOpts, setPlayerOpts] = useAtom(playerOptsAtom);
    const [currentTime, setCurrentTime] = useState(0);

    const url = getEmbeddedYoutubeUrl(playerOpts.url);
    const playerRef = createRef<HTMLDivElement>();
    const playerElement = <Box ref={playerRef}></Box>;

    const youtubeId = getYoutubeIdFromUrl(playerOpts.url);

    const player = new YoutubeController(youtubeId!, playerRef.current!, {});

    return { playerElement, playerController: player };

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

interface RenderPlayerProps {
    playerElement: Player;
}

const RenderPlayer = (renderPlayerProps: RenderPlayerProps) => {
    const { playerElement } = renderPlayerProps;
    return <Box>{playerElement.playerElement}</Box>;
};

const syncPlayer = () => {
    const [playerOpts, setPlayerOpts] = useAtom(playerOptsAtom);

    const recivedSyncDataArray: SyncData[] = [];

    socket.on('message', (data) => {
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

        setPlayerOpts({
            url: playerOpts.url,
            currentTime: dataToSync.currentPlayingTimestamp,
        });
    });

    setInterval(() => {
        const currentPlayingTimestamp: number = playerOpts.currentTime;
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
    syncPlayer();

    return (
        <Box>
            <Heading>Syncyt</Heading>
            <Text fontSize="xl">
                Watch YouTube videos with your friends synchronously
            </Text>
            <InputEmbeddedYouTubeUrl />
            <RenderPlayer playerElement={createPlayer()} />
        </Box>
    );
}

export default App;
