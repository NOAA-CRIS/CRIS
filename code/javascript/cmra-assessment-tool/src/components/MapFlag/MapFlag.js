// Framework and third-party non-ui
import React from 'react';

// Hooks, context, and constants

// App components

// Component specific modules (Component-styled, etc.)
import './MapFlag.scss';

// Third-party components (buttons, icons, etc.)

const MapFlag = ({ text, backgroundHSL, icon }) => {
    return (
        <div className="MapFlag-container" style={{ '--flag-color-h': backgroundHSL[0], '--flag-color-s': backgroundHSL[1], '--flag-color-l': backgroundHSL[2] }}>
            {icon}
            <h3 className="MapFlag-text font-sans-2xs">{text}</h3>
        </div>
    );
};

export default MapFlag;
