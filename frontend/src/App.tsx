import { useState, useRef, createRef, useEffect } from 'react';
import { Box, Button, Heading, Input, Text } from '@chakra-ui/react';
import { embeddedYoutubeUrlAtom } from './states/atoms';
import { useAtom } from 'jotai';

const InputEmbeddedYouTubeUrl = () => {
    const [url, setUrl] = useAtom(embeddedYoutubeUrlAtom);
    return (
        <Box>
            <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter Embedded YouTube URL"
            />
            <Button onClick={() => setUrl(url)}>Submit</Button>
        </Box>
    );
};

interface PlayerOpts {
    embeddedUrl?: string;
}

type PlayerComponent = JSX.Element;

interface Player {
    iframeRef: React.RefObject<HTMLIFrameElement>;
    playerComponent: PlayerComponent;
}

const createPlayer = (playerOpts: PlayerOpts): Player => {
    const iframeRef = createRef<HTMLIFrameElement>();
    const playerComponent = (
        <iframe src={playerOpts.embeddedUrl} ref={iframeRef} />
    );
    return { iframeRef, playerComponent };
};

interface RenderPlayerProps {
    playerComponent: PlayerComponent;
}

const RenderPlayer = (renderPlayerProps: RenderPlayerProps) => {
    const { playerComponent } = renderPlayerProps;
    return <Box>{playerComponent}</Box>;
};

function App() {
    const [url, setUrl] = useAtom(embeddedYoutubeUrlAtom);
    const [player, setPlayer] = useState<Player>(createPlayer({}));

    useEffect(() => {
        const playerOpts = { embeddedUrl: url };
        setPlayer(createPlayer(playerOpts));
    });
    return (
        <Box>
            <Heading>Syncyt</Heading>
            <Text fontSize="xl">
                Watch YouTube videos with your friends synchronously
            </Text>
            <InputEmbeddedYouTubeUrl />
            <RenderPlayer playerComponent={player!.playerComponent} />
        </Box>
    );
}

export default App;
