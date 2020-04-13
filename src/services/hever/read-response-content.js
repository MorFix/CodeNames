import parseHeaderValues from './parse-header';

const promisifyFileReader = reader => new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
});

const readBlob = (blob, encoding) => {
    const reader = new FileReader();
    const promise = promisifyFileReader(reader);

    reader.readAsText(blob, encoding);

    return promise;
};

export default async response => {
    const encoding = parseHeaderValues(response.headers.get('content-type'))['charset'] || 'windows-1255';
    const blob = await response.blob();

    return await readBlob(blob, encoding);
};
