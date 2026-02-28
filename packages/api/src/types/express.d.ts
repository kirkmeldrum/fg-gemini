import { User as SharedUser } from '@foodgenie/shared';

declare global {
    namespace Express {
        // passport augments this, so we define what it contains
        interface User extends SharedUser { }
    }
}
