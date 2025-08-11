import { Button } from '@trussworks/react-uswds';
import React from 'react';
import { useAccountsContext } from '../../context/AccountsContext';

import './SignOut.scss';

const SignOut = () => {
    const { signOut } = useAccountsContext();
    return (
        <Button
            className="signOut-button"
            onClick={() => {
                signOut();
            }}
        >
            Sign Out
        </Button>
    );
};

SignOut.propTypes = {};
export default SignOut;
