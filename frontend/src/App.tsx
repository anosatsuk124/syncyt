import { useState, createRef, useEffect, RefObject } from 'react';
import { 
    Box, 
    Button, 
    Checkbox, 
    Heading, 
    Input, 
    Text, 
    Container, 
    Divider, 
    Stack,
    Tab,
    Tabs,
    TabList,
    TabPanel,
    TabPanels,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    Card,
    UnorderedList,
    ListItem,
    CardHeader,
    CardBody,
    StackDivider,
    HStack,
    Flex,
    Center,
    Collapse,
} from '@chakra-ui/react';
import { playerOptsAtom } from './states/atoms';
import { PlayerOpts } from './states/types';
import { useAtom } from 'jotai';
import { getEmbeddedYoutubeUrl, getYoutubeIdFromUrl } from './api/youtube';
import { io } from 'socket.io-client';
import { SyncData } from './types';
import YouTubePlayer from 'yt-player';
import { v4 as uuidv4 } from 'uuid';
import "@fontsource/varela-round";
import { useDisclosure } from '@chakra-ui/react'

function App() {
    const [playerOpts, setPlayerOpts] = useAtom(playerOptsAtom);
    const [playerOptsJotai, setPlayerOptsJotai] = useAtom(playerOptsAtom);
    const [playerOptsState, setPlayerOptsState] = useState<PlayerOpts>(playerOptsJotai);

    const { Player, playerElementRef } = renderPlayer();

    const [masterId, setMasterId] = useState<string | null>('');

    const id = uuidv4();

    const masterDisclosure = useDisclosure(); 
    const participantDisclosure = useDisclosure();

    let player: YouTubePlayer;

    useEffect(() => {
        player = createPlayer(playerElementRef, playerOpts.url);
        console.log('masterUserId', masterId);
        syncPlayer(player, id, masterId);
    });

    return (
        <Container maxW='container.sm' p={3}>
            <Stack spacing={4}>
                <Heading as="h1" variant="logo">
                    Syncyt
                </Heading>

                <Box>
                    <Text fontSize="xl">
                        Watch YouTube videos with your friends synchronously
                    </Text>
                </Box>

                <Divider />

                <Stack spacing={4}>
                    <Heading size="md">Step 1: Enter the URL</Heading>

                    <Input
                        value={playerOpts.url}
                        onChange={(e) =>
                            setPlayerOpts({
                                url: e.target.value,
                                currentTime: playerOpts.currentTime,
                                masterUserId: playerOpts.masterUserId,
                            })
                        }
                        placeholder="Enter YouTube URL from the share button"
                    />
                </Stack>

                <Divider />

                <Stack spacing={4}>
                    <Heading size="md">Step 2: Start or Join to Watch the Video!</Heading>
                    <Text>
                        Select whether you watch the video as a Master or a Participant. 
                    </Text>

                    <Card>
                        <CardBody>
                            <Stack spacing={5} divider={<StackDivider />}>
                                <Stack spacing={3}>
                                    <Heading size="sm" color="blue.700">
                                        Master
                                    </Heading>

                                    <Text>
                                        You can control the video playback and other participants will follow.
                                    </Text>

                                    <Button 
                                        onClick={() => {
                                            setMasterId(null);
                                            setPlayerOptsJotai(playerOpts); 
                                            masterDisclosure.onToggle();
                                        }}
                                        colorScheme="blue" variant="outline" 
                                        size="sm">
                                        <Text>
                                            Start to Watch Video as a <b><i>Master</i></b>
                                        </Text>
                                    </Button>

                                    <Collapse
                                        in={masterDisclosure.isOpen}
                                        animateOpacity>
                                        <Player />
                                    </Collapse>
                                </Stack>

                                <Stack spacing={3}>
                                    <Heading size="sm" color="teal.700">
                                        Participant
                                    </Heading>

                                    <Text>
                                        You will follow the video playback of a Master.
                                    </Text>

                                    <HStack>
                                        <Center>
                                            <Text 
                                                size="xs"
                                                minW="max-content">
                                                Master ID:
                                            </Text>
                                        </Center>

                                        <Input
                                            value={(() => {
                                                if (masterId === null) {
                                                    return '';
                                                }
                                                return masterId;
                                            })()}
                                            onChange={(e) => {
                                                setMasterId(e.target.value);
                                            }}
                                        />
                                    </HStack>

                                    <Button 
                                        onClick={() => {
                                            setPlayerOptsJotai(playerOpts)
                                        }}
                                        colorScheme="teal" 
                                        variant="outline" 
                                        size="sm">
                                        <Text>
                                            Join to Watch Video as a <b><i>Participant</i></b>
                                        </Text>
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardBody>
                    </Card>

                    <Box>
                        <Checkbox
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setMasterId(null);
                                }
                            }}
                        >
                            I am the master user
                        </Checkbox>
                        <Input
                            placeholder="Enter master ID"
                            value={(() => {
                                if (masterId === null) {
                                    return '';
                                }
                                return masterId;
                            })()}
                            onChange={(e) => {
                                setMasterId(e.target.value);
                            }}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xl">Your ID: {id}</Text>
                    </Box>
                    <Box>
                        <Button 
                            onClick={() => {
                                setPlayerOptsJotai(playerOpts)
                            }}>
                            Submit
                        </Button>
                    </Box>
                </Stack>
                <Divider />
                <Player />
            </Stack>
        </Container>
    );
}

export default App;

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
}; 

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
            if (masterUserId == data.userID) {
                console.log(`recieved master user's data`);
                // FIXME: This is hard coded
                if (
                    Math.abs(
                        ytPlayer.getCurrentTime() - data.currentPlayingTimestamp
                    ) > 3
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
                value={(() => {
                    if (opts.masterUserId === null) {
                        return '';
                    }
                    return opts.masterUserId;
                })()}
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
                checked={opts.masterUserId === null}
            >
                I am the master user
            </Checkbox>
        </Box>
    );
};
