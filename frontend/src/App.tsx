import { useState, createRef, useEffect, RefObject } from 'react';
import { Box, Button, Checkbox, Heading, Input, Text } from '@chakra-ui/react';
import { playerOptsAtom } from './states/atoms';
import { PlayerOpts } from './states/types';
import { useAtom } from 'jotai';
import { getEmbeddedYoutubeUrl, getYoutubeIdFromUrl } from './api/youtube';
import { io } from 'socket.io-client';
import { SyncData } from './types';
import YouTubePlayer from 'yt-player';
import { v4 as uuidv4 } from 'uuid';

const socket = io();

const InputEmbeddedYouTubeUrl = () => {
    const [optsJotai, setOptsJotai] = useAtom(playerOptsAtom);
    const [opts, setOpts] = useState<PlayerOpts>(optsJotai);

    return (
        <Box>
            <Input
                value={opts.url}
                onChange={(e) =>
                    setOpts({
                        url: e.target.value,
                        currentTime: opts.currentTime,
                        masterUserId: opts.masterUserId,
                    })
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

const syncPlayer = (
    ytPlayer: YouTubePlayer | undefined,
    userId: string,
    masterUserId: string | null
) => {
    // const [playerOpts, setPlayerOpts] = useAtom(playerOptsAtom);
    if (!ytPlayer) {
        console.log('youtubeController is undefined');
        return;
    }

    if (ytPlayer === null) {
        console.log('youtubeController is null');
        return;
    }

    ytPlayer.on('playing', () => {
        socket.on('sync', (data) => {
            console.log(data);
            if (masterUserId != data.userID) {
                // FIXME: This is hard coded
                if (
                    ytPlayer.getCurrentTime() - data.currentPlayingTimestamp >
                    3
                ) {
                    console.log('seeked', data.currentPlayingTimestamp);
                    ytPlayer.seek(data.currentPlayingTimestamp);
                }
            }

            //  setPlayerOpts({
            //      url: playerOpts.url,
            //      currentTime: dataToSync.currentPlayingTimestamp,
            //  });
        });

        setInterval(() => {
            if (masterUserId != null) {
                return;
            }
            // FIXME: This process should be split with another function.
            const currentPlayingTimestamp = ytPlayer.getCurrentTime();
            /// const currentPlayingTimestamp: number = playerOpts.currentTime;
            const sentTimestamp = new Date();

            const syncData: SyncData = {
                currentPlayingTimestamp,
                sentTimestamp,
                userID: userId,
            };

            socket.emit('sync', syncData);
        }, 10000);
    });
};

const SetMasterUser = () => {
    const [opts, setOpts] = useAtom(playerOptsAtom);

    return (
        <Box>
            <Input
                placeholder="Enter master ID"
                value={opts.masterUserId}
                onChange={(e) => {
                    setOpts({
                        masterUserId: e.target.value,
                        url: opts.url,
                        currentTime: opts.currentTime,
                    });
                }}
            />
            <Checkbox
                onChange={(e) => {
                    if (e.target.checked) {
                        setOpts({
                            masterUserId: null,
                            url: opts.url,
                            currentTime: opts.currentTime,
                        });
                    }
                }}
            >
                I am the master user
            </Checkbox>
        </Box>
    );
};

function App() {
    const [opts, setOpts] = useAtom(playerOptsAtom);
    const { Player, playerElementRef } = renderPlayer();
    const id = uuidv4();

    let player: YouTubePlayer;

    useEffect(() => {
        console.log('useEffect');
        player = createPlayer(playerElementRef, opts.url);
        syncPlayer(player, id, opts.masterUserId);
    });

    return (
        <Box>
            <Heading>Syncyt</Heading>
            <Text fontSize="xl">
                Watch YouTube videos with your friends synchronously
            </Text>
            <Text fontSize="xl">Your ID: {id}</Text>
            <SetMasterUser />
            <InputEmbeddedYouTubeUrl />
            <Player />
        </Box>
    );
}

export default App;
