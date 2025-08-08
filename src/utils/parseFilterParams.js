function parseType(value) {
    if (typeof value === 'undefined') {
        return undefined;
    }

    const keys = ['work', 'home', 'personal'];
    if (keys.includes(value) !== true) {
        return undefined;
    }

    return value;
}

function parseIsFavourite(value) {
    if (typeof value === 'undefined') {
        return undefined;
    }

    const parsedValue = JSON.parse(value);
    return parsedValue;
}

export function parseFilterParams(query) {
    const { type, isFavourite } = query;

    const parsedType = parseType(type);
    const parsedIsFavourite = parseIsFavourite(isFavourite);

    return {
        type: parsedType,
        isFavourite: parsedIsFavourite,
    };
}