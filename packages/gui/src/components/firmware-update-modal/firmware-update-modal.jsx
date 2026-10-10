import PropTypes from 'prop-types';
import React from 'react';

import Modal from '../../containers/modal.jsx';

import styles from './firmware-update-modal.css';

const FirmwareUpdateModal = ({onRequestClose, title}) => (
    <Modal
        fullScreen
        contentLabel={title}
        id="firmwareUpdate"
        onRequestClose={onRequestClose}
        shouldCloseOnOverlayClick={false}
    >
        <div
            className={styles.body}
            data-testid="firmware-update-dialog"
        >
            <iframe
                allow="serial"
                className={styles.frame}
                src="../toolbox/index.html"
                title={title}
            />
        </div>
    </Modal>
);

FirmwareUpdateModal.propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
};

export default FirmwareUpdateModal;
