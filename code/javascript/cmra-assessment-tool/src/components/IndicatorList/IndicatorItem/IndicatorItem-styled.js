// Framework and third-party non-ui
import styled, { css } from 'styled-components';

// Third-party components (buttons, icons, etc.)
import { Title } from '@trussworks/react-uswds';

export const Container = styled.div`
    display: flex;
    align-items: center;
    ${(props) =>
        props.selected &&
        css`
            background-color: blue;
        `};
    }
`;

export const StyledTitle = styled(Title)`
    min-width: 300px;
`;

export const MetricContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0 10px 0 10px;
`;

export const PrefixContainer = styled.div``;
export const ValueContainer = styled(Title)``;
export const PostfixContainer = styled.div``;
