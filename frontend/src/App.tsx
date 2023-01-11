import { useState, createRef } from 'react';
import { Box, Button, Heading, Input, Text } from '@chakra-ui/react';
import { playerOptsAtom } from './states/atoms';
import { PlayerOpts } from './states/types';
import { useAtom } from 'jotai';

const InputEmbeddedYouTubeUrl = () => {
    const [optsJotai, setOptsJotai] = useAtom(playerOptsAtom);
    const [opts, setOpts] = useState<PlayerOpts>(optsJotai);

    return (
        <Box>
            <Input
                value={opts.embeddedUrl}
                onChange={(e) => setOpts({ embeddedUrl: e.target.value })}
                placeholder="Enter Embedded YouTube URL"
            />
            <Button onClick={() => setOptsJotai(opts)}>Submit</Button>
        </Box>
    );
};

type PlayerElement = JSX.Element;

interface Player {
    iframeRef: React.RefObject<HTMLIFrameElement>;
    playerElement: PlayerElement;
}

const createPlayer = (playerOpts: PlayerOpts): Player => {
    const iframeRef = createRef<HTMLIFrameElement>();
    const playerElement = (
        <iframe src={playerOpts.embeddedUrl} ref={iframeRef} />
    );
    return { iframeRef, playerElement };
};

interface RenderPlayerProps {
    playerElement: PlayerElement;
}

const RenderPlayer = (renderPlayerProps: RenderPlayerProps) => {
    const { playerElement } = renderPlayerProps;
    return <Box>{playerElement}</Box>;
};

function App() {
    const [opts, setOpts] = useAtom(playerOptsAtom);
    const player = createPlayer(opts);

    return (
        <Box>
            <Heading>Syncyt</Heading>
            <Text fontSize="xl">
                Watch YouTube videos with your friends synchronously
            </Text>
            <InputEmbeddedYouTubeUrl />
            <RenderPlayer playerElement={player!.playerElement} />
        </Box>
    );
}

export default App;
