#!/usr/bin/env node

/*
Generates locales/<component>-msgs.js for each component (gui, etc) from  the
current translation files for each language for that component

Translation files are expected to be in Chrome i18n json format:
'''
{
    "message.id": {
        "message": "The translated text",
        "description": "Tips for translators"
    },
    ...
}
'''
They are named by locale, for example: 'fr.json' or 'zh-cn.json'

Converts the collection of translation files to a single set of messages.
Example output:
'''
{
  "en": {
    "action.addBackdrop": "Add Backdrop",
    "action.addCostume": "Add Costume",
    "action.recordSound": "Record Sound",
    "action.addSound": "Add Sound"
  },
  "fr": {
    "action.addSound": "Ajouter Son",
    "action.addCostume": "Ajouter Costume",
    "action.addBackdrop": "Ajouter Arrière-plan",
    "action.recordSound": "Enregistrement du Son"
  }
}
'''
NOTE: blocks messages are plain key-value JSON files

Missing locales are ignored, react-intl will use the default messages for them.
 */
import * as fs from 'fs';
import * as path from 'path';
import {sync as mkdirpSync} from 'mkdirp';
import defaultsDeep from 'lodash.defaultsdeep';
import locales from '../src/supported-locales.js';

const MSGS_DIR = './locales/';
mkdirpSync(MSGS_DIR);
let missingLocales = [];

const combineJson = (component) => {
    return Object.keys(locales).reduce((collection, lang) => {
        try {
            let langData = JSON.parse(
                fs.readFileSync(path.resolve('editor', component, lang + '.json'), 'utf8')
            );
            collection[lang] = langData;
        } catch (e) {
            missingLocales.push(component + ':' + lang + '\n');
        }
        return collection;
    }, {});
};

// generate the blocks and desktop messages: files are plain key-value JSON
let keyValueComponents = ['blocks', 'desktop'];
keyValueComponents.forEach((component) => {
    let messages = combineJson(component);
    let data =
        '// GENERATED FILE:\n' +
        'export default ' +
        JSON.stringify(messages, null, 2) +
        ';\n';
    fs.writeFileSync(MSGS_DIR + component + '-msgs.js', data);
});

// generate messages for gui components - all files are plain key-value JSON
let components = ['interface', 'extensions', 'paint-editor'];
let editorMsgs = {};
components.forEach((component) => {
    let messages = combineJson(component);
    let data =
        '// GENERATED FILE:\n' +
        'export default ' +
        JSON.stringify(messages, null, 2) +
        ';\n';
    fs.writeFileSync(MSGS_DIR + component + '-msgs.js', data);
    defaultsDeep(editorMsgs, messages);
});

// generate combined editor-msgs file
let editorData =
    '// GENERATED FILE:\n' +
    'export default ' +
    JSON.stringify(editorMsgs, null, 2) +
    ';\n';
fs.writeFileSync(MSGS_DIR + 'editor-msgs.js', editorData);

// generate the link-desktop messages: files are plain key-value JSON
let keyValue = 'link-desktop';
let messages = combineJson(keyValue);
let data =
    '// GENERATED FILE:\n' +
    'module.exports = ' +
    JSON.stringify(messages, null, 2) +
    ';\n';
fs.writeFileSync(MSGS_DIR + 'link-desktop-msgs.js', data);

if (missingLocales.length > 0) {
    process.stdout.write('missing locales:\n' + missingLocales.toString());
    process.exit(1);
}
