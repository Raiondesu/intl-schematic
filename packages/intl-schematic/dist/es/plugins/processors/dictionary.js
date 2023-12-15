export const dictionary = () => (options) => (input) => {
    try {
        return (options && input.value in options) ? options[input.value] : input.default;
    }
    catch (error) {
        return input.default;
    }
};
