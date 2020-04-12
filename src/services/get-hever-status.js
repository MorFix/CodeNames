import HTMLParser from 'fast-html-parser';

const baseUrl = 'https://www.hvr.co.il';
const IGNORED_COOKIES = ['path', 'secure', 'samesite'];

const splitSingleHeaderValue = pair => {
    const split = pair.split('=');
    split[0] = split[0].trim();

    return split;
};

const parseHeaderValues = headerString => (headerString || '')
    .split(/;|,\s/)
    .map(splitSingleHeaderValue)
    .filter(([_, value]) => !!value)
    .reduce((all, [name, value]) => ({...all, [name]: value}), {}) || {};

const getInitialCookies = async () => {
    const response = await fetch(`${baseUrl}/signin.aspx`, {method: "GET", credentials: 'omit'});

    return parseHeaderValues(response.headers.get('set-cookie'));
};

const getEntertainmentPage = async () => {
    //return "NO SHOWS";
};

const hasNoShowsMessage = page => {
    return page.includes("NO SHOWS");
};

const buildCookieHeader = initialCookies => ({Cookie: Object.keys(initialCookies)
    .filter(cookieName => !IGNORED_COOKIES.includes(cookieName.toLowerCase()))
    .map(cookieName => `${cookieName}=${initialCookies[cookieName]}`)
    .join(';')});

const getCN = async initialCookies => {
    const options = {
        credentials: 'omit',
        headers: {
            ...buildCookieHeader(initialCookies)
        }
    };

    const basicPageResponse = await fetch(`${baseUrl}/signin.aspx`, options);
    const basicPageContent = await readEncodedContent(basicPageResponse);

    const basicPageDom = HTMLParser.parse(basicPageContent);

    const cn =  basicPageDom.querySelectorAll('input')
        .find(x => x.attributes?.name === 'cn')
        ?.attributes
        .value;

    if (!cn) {
        throw new Error('Cannot find CN in base document');
    }

    return cn;
};

const promisifyFileReader = reader =>
    new Promise((resolve, reject) => {
        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(reader.error);
        };
    });

const readBlob = (blob, encoding) => {
    const reader = new FileReader();
    const promise = promisifyFileReader(reader);

    reader.readAsText(blob, encoding);

    return promise;
};

const readEncodedContent = async response => {
    const encoding = parseHeaderValues(response.headers.get('content-type'))['charset'];
    const blob = await response.blob();

    return await readBlob(blob, encoding);
};

const buildLoginParams = async initialCookies => {
    const cn = await getCN(initialCookies);

    return {
        cn,
        tz: '',
        password: '',
        oMode: 'login',
    };
};

const login = async initialCookies => {
    const SUCCESS_TEXT = 'Ok...';
    const loginParams = await buildLoginParams(initialCookies);
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        ...buildCookieHeader(initialCookies)
    };

    const url = `${baseUrl}/signin.aspx`;
    const options = {
        method: 'POST',
        credentials: 'omit',
        body: new URLSearchParams(loginParams).toString(),
        headers
    };

    const loginResponse = await fetch(url, options);
    const content = await readEncodedContent(loginResponse);

    if (content !== SUCCESS_TEXT) {
        throw new Error(`Login failed: ${content}`)
    }

    return parseHeaderValues(loginResponse.headers.get('set-cookie'));
};

export const isEntertainmentAvailable = async () => {
    const initialCookies = await getInitialCookies();
    const newCookies = await login(initialCookies);

    Object.assign(initialCookies, newCookies);

    const response = await getEntertainmentPage();

    return {a: true, s: response};
};
