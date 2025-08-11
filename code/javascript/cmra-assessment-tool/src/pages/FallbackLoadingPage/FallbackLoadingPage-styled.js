import styled from 'styled-components';

import { CalciteLoader } from '@esri/calcite-components-react';

import splashImage from '../../images/splashBackground.jpg';

export const LoaderContainer = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: url(${splashImage}) center/cover no-repeat;
`;

export const StyledLoader = styled(CalciteLoader)`
    margin: auto;
`;
