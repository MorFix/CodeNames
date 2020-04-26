import HTMLParser from 'fast-html-parser';
import fetchWithCookies from './fetch-with-cookies';
import parseHeaderValues from './parse-header';
import readEncodedContent from './read-response-content';

import {
  heverUrl as baseUrl,
  loginPage,
  entertainmentPage,
  logoutPage,
  loginSuccessMessage,
  noShowsMessage,
} from './config';

const SET_COOKIE_HEADER_NAME = 'set-cookie';

const getInitialCookies = async () => {
  const response = await fetch(`${baseUrl}/${loginPage}`, {
    credentials: 'omit',
  });

  return parseHeaderValues(response.headers.get(SET_COOKIE_HEADER_NAME));
};

const getEntertainmentPage = async cookies => {
  const response = await fetchWithCookies(
    `${baseUrl}/${entertainmentPage}`,
    null,
    cookies,
  );
  const content = await readEncodedContent(response);

  return HTMLParser.parse(content);
};

const getCN = async cookies => {
  const basicPageResponse = await fetchWithCookies(
    `${baseUrl}/${loginPage}`,
    null,
    cookies,
  );
  const basicPageContent = await readEncodedContent(basicPageResponse);

  const basicPageDom = HTMLParser.parse(basicPageContent);

  const cn = basicPageDom
    .querySelectorAll('input')
    .find(x => x.attributes?.name === 'cn')?.attributes.value;

  if (!cn) {
    throw new Error('Cannot find CN in base document');
  }

  return cn;
};

const login = async (tz, password, cookies) => {
  const cn = await getCN(cookies);

  const loginParams = {cn, tz, password, oMode: 'login'};
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: '*/*',
  };
  const options = {
    headers,
    method: 'POST',
    body: new URLSearchParams(loginParams).toString(),
  };

  const loginResponse = await fetchWithCookies(
    `${baseUrl}/${loginPage}`,
    options,
    cookies,
  );
  const content = await readEncodedContent(loginResponse);

  if (content !== loginSuccessMessage) {
    throw new Error(`ההתחברות נכשלה: ${HTMLParser.parse(content)?.text.trim()}`);
  }

  return parseHeaderValues(loginResponse.headers.get(SET_COOKIE_HEADER_NAME));
};

export const getEntertainmentStatus = async (userId, password) => {
  const initialCookies = await getInitialCookies();
  const loginCookies = await login(userId, password, initialCookies);

  const cookies = {...initialCookies, ...loginCookies};

  const entertainmentPageDom = await getEntertainmentPage(cookies);
  const relevantText = entertainmentPageDom
    .querySelectorAll('.box')[0]
    ?.text.trim();

  // Log out
  await fetchWithCookies(`${baseUrl}/${logoutPage}`, null, cookies);

  return {
    isAvailable: !relevantText.includes(noShowsMessage),
    content: relevantText,
  };
};
