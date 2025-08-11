import styled, { css } from 'styled-components';

export const StyledMap = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    ${(props) =>
        !props.isLoaded &&
        css`
            visibility: hidden;
        `};
`;
