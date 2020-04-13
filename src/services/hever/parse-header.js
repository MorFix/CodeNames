const splitSingleHeaderValue = pair => {
    const split = pair.split('=');
    split[0] = split[0].trim();

    return split;
};

export default headerString => (headerString || '')
    .split(/;|,\s/)
    .map(splitSingleHeaderValue)
    .filter(([_, value]) => !!value)
    .reduce((all, [name, value]) => ({...all, [name]: value}), {});
