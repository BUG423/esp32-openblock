/**
 * @fileoverview
 * Download external-resource from the specified repository, extract it and check the comparison checksum
 *
 * use --repo to specify the download address, e.g: --repo=openblockcc/external-resources
 * use --plat to Specify the download platform, gitee or github
 * use --cdn to specify the use of the cdn proxy server address, e.g: --cdn=https://cdn.openblock.cc/
 */

const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const ProgressBar = require('progress');
const extract = require('extract-zip');
const hashFiles = require('hash-files');
const clc = require('cli-color');
const Progress = require('node-fetch-progress');

const { checkDirHash } = require('../src/calc-dir-hash');
const { formatTime } = require('../src/format');
const parseArgs = require('./parseArgs');
const getConfigHash = require('../src/get-config-hash');


const { repo, plat, cdn } = parseArgs();


if (!repo) {// repo = embedded-alpha-team/external-resources-loongson-v2
    console.error(clc.red('ERR!: No repo specified'));
    process.exit(1);
}

const getLatest = () => {
    let url;
    if (plat === 'github' || !plat) {
        url = `https://api.github.com/repos/${repo}/releases/latest`;
    } else if (plat === 'gitee') {
        url = `https://gitee.com/api/v5/repos/${repo}/releases/latest`;
    }
    if (cdn) {
        url = `${cdn}/${url}`;
    }

    return new Promise((resolve, reject) => {// ?异步执行,判断fetch返回的结果是否正确
        fetch(url)
            .then(res => resolve(res.json()))// 返回结果解析的json
            .catch(err => reject(err));
    });
};

const download = (url, dest) => {// argus: url,path
    const green = '\u001b[42m \u001b[0m';// make console print with color 
    const red = '\u001b[41m \u001b[0m';

    if (cdn) {
        url = `${cdn}/${url}`;
    }

    return new Promise((resolve, reject) => {
        const bar = new ProgressBar('downloading [:bar] :tokenSpeed    :tokenSize   :tokenRemaining', {
            complete: green, // 进度条
            incomplete: red,
            total: 100,
            clear: true
        });

        console.log('download from url:', url);

        fetch(url)
            .then(res => { // 下载成功的处理
                if (res.status !== 200) {
                    return reject(`Got status code ${res.status}: ${res.statusText}`);
                }
                const fileStream = fs.createWriteStream(dest);

                res.body.pipe(fileStream);
                res.body.on('error', err => {// 错误时进度条终止
                    bar.terminate();
                    return reject(err);
                });

                fileStream.on('finish', () => { // 文件流 写入(下载)完成
                    bar.update(1);
                    console.log(`${path.basename(dest)} download complete`);
                    return resolve();
                });

                const progress = new Progress(res, { throttle: 100 });

                progress.on('progress', state => {
                    bar.update(state.progress, {
                        tokenSpeed: state.rateh,
                        tokenSize: `${state.doneh}/${state.totalh}`,
                        tokenRemaining: formatTime(state.eta)
                    });
                });
            })
            .catch(err => reject(err));// if error
    });
};

getLatest()
    .then(data => { // 对结果的json进行操作
        const assets = data.assets;
        let resource;
        let checksum;

        assets.forEach(asset => {// 将校验码与文件分开,(我们需要生成校验码?)
            if (asset.name) {
                if (asset.name.includes('checksums')) {
                    checksum = asset;
                } else if (asset.name.includes('external-resources')) {
                    resource = asset;
                }
            }
            console.log(asset.name)
        });

        const downloadPath = path.resolve('./', 'download');
        fs.ensureDirSync(downloadPath);// 确保文件夹 download 存在

        const resourceUrl = resource.browser_download_url;
        const resourceName = resource.name;
        const resourcePath = path.join(downloadPath, resourceName);

        const checksumUrl = checksum.browser_download_url;
        const checksumName = checksum.name;
        const checksumPath = path.join(downloadPath, checksumName);

        const extractPath = path.resolve('./', 'external-resources');// 解压到文件夹external-resources

        return download(resourceUrl, resourcePath)
            .then(() => download(checksumUrl, checksumPath))// 先下载   checksumPath=(就是校验码的文件)
            .then(() => { // 再比较校验码
                // Compare archive checksums
                const zipChecksum = fs.readFileSync(checksumPath, 'utf8').split('  ')[0];// 读取校验码文件
                hashFiles({ files: resourcePath, algorithm: 'sha256' }, (error, hash) => {
                    if (error) {
                        throw error;
                    }
                    console.log('hash file: ' + hash);
                    console.log('zipChecksum:' + zipChecksum);
                    if (zipChecksum === hash) { // 
                        console.info(`${resourcePath} has passed the checksum detection`);
                        extract(resourcePath, { dir: extractPath }) // 这个地方进行解压
                            // .then(() => {
                                // Compare folder checksums 省略解压验证
                                // const configFilePath = path.resolve(extractPath, 'config.json');
                                // const dirHash = getConfigHash(configFilePath); // 就是已经删除的那个sha256
                                // if (!dirHash) {
                                //     console.warn(clc.yellow(`WARN: no hash value found in ${configFilePath}`));
                                //     return Promise.resolve();
                                // }
                                // return checkDirHash(extractPath, dirHash);
                            // })
                            .then(() => {
                                fs.rmSync(downloadPath, { recursive: true, force: true });

                                console.log(clc.green(`\nExternal resource has been successfully downloaded and extracted to path: ${extractPath}`)); // eslint-disable-line max-len
                            })
                            .catch(() => {// if error
                                console.error(clc.red(`ERR!: ${extractPath} has failed the folder checksum detection`));
                                process.exit(1);
                            });
                    } else {
                        console.error(clc.red(`ERR!: ${resourcePath} has failed the checksum detection`));
                        process.exit(1);
                    }
                });
            });

    })
    .catch(err => console.log(clc.red(`ERR!: ${err}`)));
