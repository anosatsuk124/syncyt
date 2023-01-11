import { useState, createRef } from 'react';
import { Box, Button, Heading, Input, Text } from '@chakra-ui/react';
import { playerOptsAtom } from './states/atoms';
import { PlayerOpts } from './states/types';
import { useAtom } from 'jotai';
import { getEmbeddedYoutubeUrl } from './api/youtube';

const InputEmbeddedYouTubeUrl = () => {
    const [optsJotai, setOptsJotai] = useAtom(playerOptsAtom);
    const [opts, setOpts] = useState<PlayerOpts>(optsJotai);

    return (
        <Box>
            <Input
                value={opts.url}
                onChange={(e) => setOpts({ url: e.target.value })}
                placeholder="Enter YouTube URL from the share button"
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

    try {
        const embeddedUrl = getEmbeddedYoutubeUrl(playerOpts.url);

        const playerElement = <iframe src={embeddedUrl} ref={iframeRef} />;
        return { iframeRef, playerElement };
    } catch {
        const errorMessages = (
            <Text>
                The URL must be got from the YouTube share button. (This issues
                will be fix.)
            </Text>
        );
        return { iframeRef, playerElement: errorMessages };
    }
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
