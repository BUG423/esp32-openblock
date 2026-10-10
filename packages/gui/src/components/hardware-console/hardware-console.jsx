import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ScrollableFeed from 'react-scrollable-feed';

import Box from '../box/box.jsx';
import MenuBarMenu from '../menu-bar/menu-bar-menu.jsx';
import { MenuItem, MenuSection } from '../menu/menu.jsx';
import styles from './hardware-console.css';
import cleanIcon from './clean.svg';
import settingIcon from './setting.svg';
import pauseIcon from './pause.svg';
import startIcon from './start.svg';

const toHexForm = buffer => Array.prototype.map.call(buffer,
    x => x.toString(16).toUpperCase()).join(' ');

const HardwareConsoleComponent = props => {
    const {
        baudrate,
        baudrateList,
        consoleArray,
        consoleSpanArray, // MARK qi consoleSpanArray
        eol,
        eolList,
        intl,
        isAutoScroll,
        isHexForm,
        showTimestamp,
        isPause,
        onClickClean,
        onClickPause,
        onClickSerialportMenu,
        onClickHexForm,
        onClickTimestamp,
        onClickAutoScroll,
        onClickSend,
        onInputChange,
        onKeyPress,
        onKeyDown,
        onRequestSerialportMenu,
        onSelectBaudrate,
        onSelectEol,
        serialportMenuOpen
    } = props;
    return ( // MARK consoleArrayStdio
        <Box className={styles.hardwareConsoleWrapper}>
            <Box className={styles.consoleArray}>
                <ScrollableFeed
                    forceScroll={isAutoScroll}
                >
                    <span>
                        {isHexForm ? toHexForm(consoleArray) : new TextDecoder('utf-8').decode(consoleArray)}
                    </span>

                    {consoleSpanArray.map(item => (

                        <span
                            key={item.key}
                            className={item.type}
                        >
                            <span className={styles.consoleTimestamp}>
                                {showTimestamp ? ("[" + item.time + "] ") : ''}
                            </span>
                            {isHexForm ? toHexForm(item.value) : new TextDecoder('utf-8').decode(item.value)}
                        </span>
                    ))}
                </ScrollableFeed>
            </Box>
            <button
                className={classNames(styles.button, styles.pauseButton)}
                onClick={onClickPause}
            >
                <img
                    alt="Pause"
                    className={classNames(styles.pauseIcon)}
                    src={isPause ? startIcon : pauseIcon}
                />
            </button>
            <button
                className={classNames(styles.button, styles.cleanButton)}
                onClick={onClickClean}
            >
                <img
                    alt="Clean"
                    className={classNames(styles.cleanIcon)}
                    src={cleanIcon}
                />
            </button>
            <Box className={styles.consoleMenuWarpper}>
                <input
                    className={styles.consoleInput}
                    onChange={onInputChange}
                    onKeyPress={onKeyPress}
                    onKeyDown={onKeyDown}
                />
                <button
                    className={classNames(styles.button, styles.sendButton)}
                    onClick={onClickSend}
                >
                    <FormattedMessage
                        defaultMessage="Send"
                        description="Button in bottom to send data to serialport"
                        id="gui.hardwareConsole.send"
                    />
                </button>
                <button
                    className={classNames(styles.button, styles.settingButton)}
                >
                    <img
                        alt="Setting"
                        className={classNames(styles.settingIcon, {
                            [styles.active]: serialportMenuOpen
                        })}
                        src={settingIcon}
                        onMouseUp={onClickSerialportMenu}
                    />
                    <MenuBarMenu
                        className={classNames(styles.MenuBarMenu)}
                        menuClassName={styles.menu}
                        open={serialportMenuOpen}
                        place={'left'}
                        directiron={'up'}
                        onRequestClose={onRequestSerialportMenu}
                    >
                        {/* <MenuSection >
                            <MenuItem
                                isRtl={props.isRtl}
                            >
                                <FormattedMessage
                                    defaultMessage="Buadrate"
                                    description="Serial buadrate."
                                    id="gui.hardwareConsole.buadrate"
                                />
                                <select
                                    onChange={onSelectBaudrate}
                                >
                                    {baudrateList.map(item => (
                                        <option
                                            key={item.key}
                                            selected={baudrate === item.key}
                                        >
                                            {item.value}
                                        </option>
                                    ))}
                                </select>
                            </MenuItem>
                            <MenuItem
                                isRtl={props.isRtl}
                            >
                                <FormattedMessage
                                    defaultMessage="End of line"
                                    description="End of line."
                                    id="gui.hardwareConsole.endOfLine"
                                />
                                <select
                                    onChange={onSelectEol}
                                >
                                    {eolList.map(item => (
                                        <option
                                            key={item.key}
                                            selected={eol === item.key}
                                        >
                                            {intl.formatMessage(item.value)}
                                        </option>
                                    ))}
                                </select>
                            </MenuItem>
                        </MenuSection> */}
                        <MenuSection >
                            <MenuItem
                                onClick={onClickTimestamp}
                                isRtl={props.isRtl}
                            >
                                <FormattedMessage
                                    defaultMessage="Show timestamp"
                                    description="Display timestamp in line."
                                    id="gui.hardwareConsole.timestamp"
                                />
                                <input
                                    type="checkbox"
                                    name="timestamp"
                                    checked={showTimestamp}
                                    readOnly
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={onClickHexForm}
                                isRtl={props.isRtl}
                            >
                                <FormattedMessage
                                    defaultMessage="Hex form"
                                    description="Display serial port data in hexadecimal."
                                    id="gui.hardwareConsole.hexform"
                                />
                                <input
                                    type="checkbox"
                                    name="hexform"
                                    checked={isHexForm}
                                    readOnly
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={onClickAutoScroll}
                                isRtl={props.isRtl}
                                bottomLine
                            >
                                <FormattedMessage
                                    defaultMessage="Auto scroll"
                                    description="Auto scroll serialport console data."
                                    id="gui.hardwareConsole.autoScroll"
                                />
                                <input
                                    type="checkbox"
                                    name="autoScroll"
                                    checked={isAutoScroll}
                                    readOnly
                                />
                            </MenuItem>
                        </MenuSection>
                    </MenuBarMenu>
                </button>
            </Box>
        </Box >
    );
};

HardwareConsoleComponent.propTypes = {
    baudrate: PropTypes.string.isRequired,
    baudrateList: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired
        })),
    consoleArray: PropTypes.instanceOf(Uint8Array),
    // MARK consoleSpanArray: PropTypes.arrayOf(PropTypes.shape({
    consoleSpanArray: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        value: PropTypes.instanceOf(Uint8Array).isRequired
    })),
    eol: PropTypes.string.isRequired,
    eolList: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            value: PropTypes.shape({
                defaultMessage: PropTypes.string.isRequired,
                description: PropTypes.string,
                id: PropTypes.string.isRequired
            })
        })),
    intl: intlShape,
    isRtl: PropTypes.bool,
    isHexForm: PropTypes.bool.isRequired,
    isPause: PropTypes.bool.isRequired,
    isAutoScroll: PropTypes.bool.isRequired,
    onClickClean: PropTypes.func.isRequired,
    onClickPause: PropTypes.func.isRequired,
    onClickAutoScroll: PropTypes.func.isRequired,
    onClickHexForm: PropTypes.func.isRequired,
    onClickTimestamp: PropTypes.func.isRequired, // MARK onClickTimestamp
    onClickSend: PropTypes.func.isRequired,
    onClickSerialportMenu: PropTypes.func.isRequired,
    onInputChange: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    onRequestSerialportMenu: PropTypes.func.isRequired,
    onSelectBaudrate: PropTypes.func.isRequired,
    onSelectEol: PropTypes.func.isRequired,
    serialportMenuOpen: PropTypes.bool.isRequired
};

export default HardwareConsoleComponent;
