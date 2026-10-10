import React from 'react';
import {FormattedMessage} from 'react-intl';

import makeymakeyIconURL from './makeymakey/makeymakey.png';
import makeymakeyInsetIconURL from './makeymakey/makeymakey-small.svg';

// Software-only extensions are intentionally excluded from this hardware-focused build.
export default [
    {
        name: (
            <FormattedMessage
                defaultMessage="Makey Makey"
                description="Name for the Makey Makey hardware extension"
                id="gui.extension.makeymakey.name"
            />
        ),
        extensionId: 'makeymakey',
        collaborator: 'JoyLabz',
        iconURL: makeymakeyIconURL,
        insetIconURL: makeymakeyInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Make anything into a key."
                description="Description for the Makey Makey hardware extension"
                id="gui.extension.makeymakey.description"
            />
        ),
        featured: true
    }
];
