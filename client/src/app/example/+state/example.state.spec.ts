import { exampleReducer, ExampleAction } from './example.state';

describe('example reducer test', () => {
    it('should correctly add to collection', () => {
        const added = exampleReducer({ collection: [1] }, ExampleAction.addToCollection(2));
        expect(added).toMatchSnapshot();
    });
    it('should correctly remove from collection', () => {
        const added = exampleReducer({ collection: [1, 2, 3] }, ExampleAction.removeFromCollection(1));
        expect(added).toMatchSnapshot();
    });
});
