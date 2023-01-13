import { extendTheme, Heading } from '@chakra-ui/react';

const theme = extendTheme({
    components: {
        Heading: {
            variants: {
                'logo': {
                    fontFamily: `'Varela Round', sans-serif`,
                }
            }
        }
    }
})

export default theme; 