const path = require('path');
const requireAll = require('require-all');
const formatMessage = require('format-message');
const fs = require('fs');
const copydir = require('copy-dir');
const { defaultsDeep } = require('lodash');
const buildPath = path.join(__dirname, '../dist/extensions');
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
// add translations ↑

// var translations = require(path.join(__dirname, '../external-resources/locales.js'));

const translations = require(path.join(__dirname, '../external-resources/third-party-locales.json'));


const EXTENSION_CLASS = ['shield', 'actuator', 'sensor', 'communication', 'display', 'kit', 'other'];
const DEVICE_TYPE = ['arduino', 'microbit', 'microPython','loongson'];// attention

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
    // console.log(translations)
    locale = locale[0]// change to locale[1];?
    console.log(locale)
    // console.log("dirname =>",__dirname);
    formatMessage.setup({
        locale: locale,
        translations: translations
    });
    const extensionsThumbnailData = [];

    DEVICE_TYPE.forEach(deviceType => {
        EXTENSION_CLASS.forEach(extClass => {
            const extPath = path.join(__dirname, '../external-resources/extensions', deviceType, extClass);
            // console.log("extPath",extPath)

            if (fs.existsSync(extPath)) {
                const data = requireAll({ dirname: extPath, filter: /index.js$/, recursive: true });
                Object.entries(data).forEach(ext => {
                    // Modify the attribute to point to the real address.
                    const content = ext[1]['index.js'](formatMessage);
                    const basePath = path.join(url, deviceType, extClass, ext[0]);
                    // console.log("basePath",basePath)
                    if (content.iconURL) {
                        content.iconURL = path.join(basePath, content.iconURL);
                    }
                    content.blocks = path.join(basePath, content.blocks);
                    content.generator = path.join(basePath, content.generator);
                    content.toolbox = path.join(basePath, content.toolbox);
                    content.msg = path.join(basePath, content.msg);

                    if (content.library) {
                        content.library = path.join(extPath, ext[0], content.library);
                    }
                    extensionsThumbnailData.push(content);
                });
            }
        });//basePath https:/openblockcc.github.io/external-resources/microbit/display/servo ??
    });// extPath /mnt/d/Desktop/3下/longxin/openblock-resource-loongson/external-resources/extensions/microbit/kit

    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath, { recursive: true });
    }

    copydir.sync(path.join(__dirname, '../external-resources/extensions'), buildPath, {
        utimes: true,
        mode: true,
        filter: (stat, filepath, filename) => {
            // do not want copy .js files
            if (stat === 'file' && (filename === 'index.js' || filename === 'locales.js')) {
                return false;
            }
            if (stat === 'directory' && filename === 'lib') {
                return false;
            }
            return true;
        }
    });
    fs.writeFileSync(path.join(buildPath, `${locale}.json`), JSON.stringify(extensionsThumbnailData));

});
