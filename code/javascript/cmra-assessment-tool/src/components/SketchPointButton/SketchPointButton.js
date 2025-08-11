// Framework and third-party non-ui
import React, { useState } from 'react';

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { useSketchViewModel } from '../../hooks/useSketchViewModel';
import { useOnEvent } from '../../hooks/useWatch';

// App components

// Component specific modules (Component-styled, etc.)
import './SketchPointButton.scss';

// Third-party components (buttons, icons, etc.)
import { IconClose, IconLocationOn, Tooltip } from '@trussworks/react-uswds';

const SketchPointButton = ({ view, onSketchComplete }) => {
    const { t } = useTranslation();
    const [sketchViewModel] = useSketchViewModel(view);
    const [active, setActive] = useState(false);

    // Watch for sketch complete
    useOnEvent(sketchViewModel, 'create', (args) => {
        if (args.state === 'complete') {
            onSketchComplete(args.graphic);
            setActive(false);
        }
    });

    const handleClick = () => {
        const updatedActive = !active;
        setActive(updatedActive);
        if (updatedActive) {
            sketchViewModel.create('point');
        } else {
            sketchViewModel.cancel();
        }
    };

    return (
        <Tooltip
            className="sketchPointButton-container grid-row flex-row flex-align-center flex-justify-center usa-button--white-outline"
            onClick={handleClick}
            label={t('Search.MapPin')}
        >
            {active ? <IconClose /> : <IconLocationOn />}
        </Tooltip>
    );
};

export default SketchPointButton;
