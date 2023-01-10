import { config } from 'dotenv';

const result = config({
    path: '../../.env',
});

if (result.error) {
    throw result.error;
}
