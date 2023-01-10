import { useState } from 'react';
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
                placeholder="Enter YouTube URL"
            />
            <Button onClick={() => setUrl(url)}>Submit</Button>
        </Box>
    );
};

interface RenderIFrameProps {
    embeddedUrl: string;
}

const RenderIFrame = (renderIFrameProps: RenderIFrameProps) => {
    return <iframe src={renderIFrameProps.embeddedUrl} />;
};

function App() {
    const [url, setUrl] = useAtom(embeddedYoutubeUrlAtom);
    return (
        <Box>
            <Heading>Syncyt</Heading>
            <Text fontSize="xl">
                Watch YouTube videos with your friends synchronously
            </Text>
            <InputEmbeddedYouTubeUrl />
            <RenderIFrame embeddedUrl={url} />
        </Box>
    );
}

export default App;
