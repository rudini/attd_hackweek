import { unionize } from "unionize";
export { ofType } from 'unionize';

export const unionizeActions = <T>(record: T) => unionize(record, 'type', 'payload');
