import axios from "axios";

const baseUrl = 'https://hvr.co.il/';

const grabSession = async () => {
    const response = await fetch(baseUrl, {method: "GET", credentials: 'omit'});

    return response.headers.map['set-cookie']
        ?.split(/;|,\s/)
        .map(x => x.split('='))
        .filter(pair => !!pair[1])
        .reduce((all, currentPair) => {
            all[currentPair[0].toLowerCase().trim()] = currentPair[1];

            return all;
        }, {}) || {};
};

const getEntertainmentPage = async () => {
    const session = await grabSession();

    //return "NO SHOWS";
    return session;
};

const hasNoShowsMessage = page => {
    return page.includes("NO SHOWS");
};

export const isEntertainmentAvailable = async () => {
    const response = await getEntertainmentPage();

    return {a: true/*!hasNoShowsMessage(response)*/, s: response};
};
