const path = require('path');
const requireAll = require('require-all');
const formatMessage = require('format-message');
const fs = require('fs');
const copydir = require('copy-dir');
const {defaultsDeep} = require('lodash');

const buildPath = path.join(__dirname, '../dist/devices');

// function get_translation() {
//     const OFFICIAL_TRANSLATIONS_FILE = 'official-locales.json';
//     const THIRD_PARTY_TRANSLATIONS_FILE = 'third-party-locales.json';
//     let officialTranslations;
//     let thirdPartyTranslations;
//     try {// !!! 这里进行翻译的组合
//         officialTranslations = JSON.parse(fs.readFileSync(path.join("external-resources", OFFICIAL_TRANSLATIONS_FILE), 'utf8')); // eslint-disable-line max-len
//         thirdPartyTranslations = JSON.parse(fs.readFileSync(path.join("external-resources", THIRD_PARTY_TRANSLATIONS_FILE), 'utf8')); // eslint-disable-line max-len
//         // console.log('officialTranslations', officialTranslations);
//     } catch (e) {
//         console.error((`ERR!: ${e}`)); // eslint-disable-line max-len
//         // this.emit('error', e);
//     }
//     var translations = defaultsDeep(
//         {},
//         officialTranslations,
//         thirdPartyTranslations
//     );
//     return translations;
// }
// // add translations 
// const translations = get_translation();

// const translations = require('../external-resources/locales.js');
const translations = require(path.join(__dirname, '../external-resources/third-party-locales.json'));

const parseArgs = () => {
    const scriptArgs = process.argv.slice(2); // remove `node` and `this-script.js`
    const builderArgs = [];
    let url = '0.0.0.0';

    for (const arg of scriptArgs) {
        const urlSplit = arg.split(/--url(\s+|=)/);
        if (urlSplit.length === 3) {
            url = urlSplit[2];
        } else {
            builderArgs.push(arg);
        }
    }

    return url;
};

const url = parseArgs();

Object.entries(translations).forEach(locale => {
    locale = locale[0];

    formatMessage.setup({
        locale: locale,
        translations: translations
    });
    const devices = requireAll({
        dirname: path.join(__dirname, '../external-resources/devices'),
        filter: /index.js$/,
        recursive: true
    });

    const devicesThumbnailData = [];

    // eslint-disable-next-line global-require 这里是为了获取devices
    const deviceList = require(path.join(__dirname, '../external-resources/devices/device.js'));
    deviceList.forEach(listItem => {
        let matched = false;
        Object.entries(devices).forEach(catlog => {
            Object.entries(catlog[1]).forEach(dev => {
                const content = dev[1]['index.js'](formatMessage);
                if (content.deviceId === listItem) {
                    const basePath = path.join(url, catlog[0], dev[0]);

                    if (content.iconURL) {
                        content.iconURL = path.join(basePath, content.iconURL);
                    }
                    if (content.connectionIconURL) {
                        content.connectionIconURL = path.join(basePath, content.connectionIconURL);
                    }
                    if (content.connectionSmallIconURL) {
                        content.connectionSmallIconURL = path.join(basePath, content.connectionSmallIconURL);
                    }
                    matched = true;
                    devicesThumbnailData.push(content);
                }
            });
        });
        if (!matched) {
            devicesThumbnailData.push({deviceId: listItem});
        }
    });


    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath, {recursive: true});
    }

    copydir.sync(path.join(__dirname, '../external-resources/devices'), buildPath, {
        utimes: true,
        mode: true,
        filter: (stat, filepath) => {
            // do not want copy .js files
            if (stat === 'file' && path.extname(filepath) === '.js') {
                return false;
            }
            return true;
        }
    });

    fs.writeFileSync(path.join(buildPath, `${locale}.json`), JSON.stringify(devicesThumbnailData));

});
