export function mergeInputs(baseInput, input) {
    if (typeof input === 'object' && input != null) {
        for (const prop in input)
            if (input[prop] == null) {
                delete input[prop];
            }
    }
    const mergedInput = typeof baseInput === 'object' && typeof input === 'object'
        ? { ...baseInput, ...input }
        : (input ?? baseInput);
    return mergedInput;
}
