import parseHeader from './parse-header';

const IGNORED_COOKIES = ['path', 'secure', 'samesite'];

const stringifyCookies = cookies => Object.keys(cookies)
    .filter(cookieName => !IGNORED_COOKIES.includes(cookieName.toLowerCase()))
    .map(cookieName => `${cookieName}=${cookies[cookieName]}`)
    .join(';');

export default (url, initOptions, cookies = {}) => {
    const COOKIES_HEADER_NAME = 'cookie';

    initOptions = initOptions || {};

    const headers = new Headers(initOptions.headers);
    const allCookies = {
        ...parseHeader(headers.get(COOKIES_HEADER_NAME)),
        ...cookies
    };

    headers.set(COOKIES_HEADER_NAME, stringifyCookies(allCookies));

    const options = {
        ...initOptions,
        credentials: 'omit',
        headers
    };

    return fetch(url, options);
};
