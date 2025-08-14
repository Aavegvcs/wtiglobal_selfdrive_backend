export function getExtrasNamesFromArray(extrasArray : Array<any>) :string {

    if (Array.isArray(extrasArray) && extrasArray.length) {
        return extrasArray.map(extra => extra.name).join(', ');
    }
    return "No extras selected";
}