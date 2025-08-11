// Framework and third-party non-ui
import React from 'react';

// JSON & Styles
import { LoaderContainer, StyledLoader } from './FallbackLoadingPage-styled';

const FallbackLoadingPage = () => {
    return (
        <LoaderContainer>
            <StyledLoader active label="fallbackLoader" scale="m" type="indeterminate" />
        </LoaderContainer>
    );
};

export default FallbackLoadingPage;
