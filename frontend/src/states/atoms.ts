import { atom } from 'jotai';
import { PlayerOpts } from './types';

export const playerOptsAtom = atom<PlayerOpts>({
    url: '',
    currentTime: 0,
});
