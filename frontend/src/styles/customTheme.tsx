import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
    components: {
        Heading: {
            baseStyle: {},
            sizes: {},
            variants: {
                "logo": {
                    fontFamily: `"Varela Round", sans-serif`,
                },
            },
            defaultProps: {},
        },
    },
}); 

export default customTheme;